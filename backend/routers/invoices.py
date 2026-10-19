"""Fees (الأتعاب): invoices per case, manual payment marking, and PayPal pay links (Orders v2 REST)."""
import os
import secrets

import httpx
from fastapi import APIRouter, Depends, HTTPException, Request

from lib.auth import get_current_user, log_activity
from lib.db import current_office, db, raw
from models.schemas import Invoice, InvoiceIn, InvoicePublic, MarkPaidIn, PayLink, PaymentsStatus, User, now_iso

router = APIRouter()


def paypal_configured() -> bool:
    return bool(os.environ.get("PAYPAL_CLIENT_ID") and os.environ.get("PAYPAL_CLIENT_SECRET"))


def paypal_base() -> str:
    return "https://api-m.paypal.com" if os.environ.get("PAYPAL_MODE", "sandbox") == "live" else "https://api-m.sandbox.paypal.com"


async def paypal_token(http: httpx.AsyncClient) -> str:
    r = await http.post(f"{paypal_base()}/v1/oauth2/token", auth=(os.environ["PAYPAL_CLIENT_ID"], os.environ["PAYPAL_CLIENT_SECRET"]), data={"grant_type": "client_credentials"})
    r.raise_for_status()
    return r.json()["access_token"]


def public_base(request: Request) -> str:
    proto = request.headers.get("x-forwarded-proto", request.url.scheme)
    return f"{proto}://{request.headers.get('x-forwarded-host') or request.headers.get('host', '')}"


@router.get("/payments/status", response_model=PaymentsStatus)
async def payments_status(_: User = Depends(get_current_user)):
    return PaymentsStatus(paypal_configured=paypal_configured(), mode=os.environ.get("PAYPAL_MODE", "sandbox"))


@router.get("/invoices", response_model=list[Invoice])
async def list_invoices(case_id: str = "", _: User = Depends(get_current_user)):
    docs = await db.invoices.find({"case_id": case_id} if case_id else {}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return [Invoice(**d) for d in docs]


@router.post("/cases/{id}/invoices", response_model=Invoice)
async def create_invoice(id: str, body: InvoiceIn, user: User = Depends(get_current_user)):
    cs = await db.cases.find_one({"id": id}, {"_id": 0})
    if not cs:
        raise HTTPException(status_code=404, detail="case not found")
    client = await db.clients.find_one({"id": cs.get("client_id", "")}, {"_id": 0, "name": 1}) if cs.get("client_id") else None
    seq = await db.counters.find_one_and_update({"_id": "invoice"}, {"$inc": {"n": 1}}, upsert=True, return_document=True)
    inv = Invoice(**body.model_dump(), case_id=id, number=f"{now_iso()[:4]}/{seq['n']:04d}", token=secrets.token_urlsafe(18),
                  client_name=(client or {}).get("name", ""), case_file_number=cs["file_number"])
    await db.invoices.insert_one(inv.model_dump())
    await log_activity(user, "invoice.create", f"{inv.number} — {inv.amount_mad:.2f} MAD")
    return inv


@router.patch("/invoices/{id}/paid", response_model=Invoice)
async def mark_paid(id: str, body: MarkPaidIn, user: User = Depends(get_current_user)):
    d = await db.invoices.find_one_and_update({"id": id}, {"$set": {"status": "paid", "paid_at": now_iso(), "paid_method": body.method}}, projection={"_id": 0}, return_document=True)
    if not d:
        raise HTTPException(status_code=404, detail="not found")
    await log_activity(user, "invoice.paid", d["number"])
    return Invoice(**d)


@router.delete("/invoices/{id}")
async def delete_invoice(id: str, _: User = Depends(get_current_user)):
    if (await db.invoices.delete_one({"id": id})).deleted_count == 0:
        raise HTTPException(status_code=404, detail="not found")
    return {"ok": True}


# ---- public pay link (no login; unguessable token) ----
async def by_token(token: str) -> dict:
    d = await raw.invoices.find_one({"token": token}, {"_id": 0}) if len(token) >= 16 else None
    if not d or not d.get("office_id"):
        raise HTTPException(status_code=404, detail="not found")
    current_office.set(d["office_id"])
    return d


@router.get("/pay/{token}", response_model=InvoicePublic)
async def public_invoice(token: str):
    d = await by_token(token)
    office = await db.office.find_one({"_id": "office"}) or {}
    return InvoicePublic(**{k: d[k] for k in ("number", "title", "client_name", "case_file_number", "amount_mad", "pay_amount", "pay_currency", "due_date", "status")},
                         office_name=office.get("name", ""), paypal_enabled=paypal_configured() and d["pay_amount"] > 0)


@router.post("/pay/{token}/paypal", response_model=PayLink)
async def start_paypal(token: str, request: Request):
    d = await by_token(token)
    if d["status"] == "paid":
        raise HTTPException(status_code=409, detail="already paid")
    if not paypal_configured() or d["pay_amount"] <= 0:
        raise HTTPException(status_code=400, detail="online payment unavailable")
    back = f"{public_base(request)}/pay/{token}"
    async with httpx.AsyncClient(timeout=30) as http:
        at = await paypal_token(http)
        r = await http.post(f"{paypal_base()}/v2/checkout/orders", headers={"Authorization": f"Bearer {at}", "PayPal-Request-Id": f"{d['id']}-{secrets.token_hex(4)}"}, json={
            "intent": "CAPTURE",
            "purchase_units": [{"reference_id": d["id"], "custom_id": d["id"], "description": f"{d['number']} — {d['title']}"[:120],
                                "amount": {"currency_code": d["pay_currency"], "value": f"{d['pay_amount']:.2f}"}}],
            "application_context": {"return_url": f"{back}?paid=1", "cancel_url": back, "user_action": "PAY_NOW", "shipping_preference": "NO_SHIPPING"},
        })
    if r.status_code >= 300:
        raise HTTPException(status_code=502, detail="paypal error")
    link = next((l["href"] for l in r.json().get("links", []) if l.get("rel") in ("approve", "payer-action")), "")
    return PayLink(approve_url=link)


@router.post("/pay/{token}/capture", response_model=InvoicePublic)
async def capture_paypal(token: str, order_id: str):
    d = await by_token(token)
    if d["status"] != "paid":
        if not paypal_configured():
            raise HTTPException(status_code=400, detail="online payment unavailable")
        async with httpx.AsyncClient(timeout=30) as http:
            at = await paypal_token(http)
            r = await http.post(f"{paypal_base()}/v2/checkout/orders/{order_id}/capture", headers={"Authorization": f"Bearer {at}", "Content-Type": "application/json"})
            data = r.json() if r.content else {}
            if r.status_code == 422:  # already captured → read the order instead
                data = (await http.get(f"{paypal_base()}/v2/checkout/orders/{order_id}", headers={"Authorization": f"Bearer {at}"})).json()
        unit = (data.get("purchase_units") or [{}])[0]
        cap = ((unit.get("payments") or {}).get("captures") or [{}])[0]
        ok = data.get("status") == "COMPLETED" and unit.get("reference_id") == d["id"] and cap.get("amount", {}).get("value") == f"{d['pay_amount']:.2f}"
        if not ok:
            raise HTTPException(status_code=402, detail="payment not completed")
        await db.invoices.update_one({"id": d["id"]}, {"$set": {"status": "paid", "paid_at": now_iso(), "paid_method": "paypal", "paypal_order_id": order_id}})
    return await public_invoice(token)
