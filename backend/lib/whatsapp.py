"""Automatic WhatsApp messages via Twilio — prepared, inactive until these are set in backend/.env:
TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM (e.g. whatsapp:+14155238886).
"""
import os
import re

import httpx


def configured() -> bool:
    return all(os.environ.get(k) for k in ("TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_WHATSAPP_FROM"))


def to_e164(phone: str) -> str:
    """Moroccan numbers: 06…/07…/05… → +2126…; keeps numbers already in +E.164."""
    digits = re.sub(r"[^\d+]", "", phone or "")
    if re.fullmatch(r"0[5-7]\d{8}", digits):
        return "+212" + digits[1:]
    if re.fullmatch(r"00\d{8,15}", digits):
        return "+" + digits[2:]
    if re.fullmatch(r"212[5-7]\d{8}", digits):
        return "+" + digits
    return digits if digits.startswith("+") else ""


async def send_whatsapp(to_phone: str, text: str) -> None:
    to = to_e164(to_phone)
    if not configured() or not to:
        return
    sid = os.environ["TWILIO_ACCOUNT_SID"]
    async with httpx.AsyncClient(timeout=20) as client:
        r = await client.post(
            f"https://api.twilio.com/2010-04-01/Accounts/{sid}/Messages.json",
            auth=(sid, os.environ["TWILIO_AUTH_TOKEN"]),
            data={"From": os.environ["TWILIO_WHATSAPP_FROM"], "To": f"whatsapp:{to}", "Body": text[:1500]},
        )
    r.raise_for_status()
