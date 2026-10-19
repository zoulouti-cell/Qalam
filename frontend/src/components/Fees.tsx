import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, MessageCircle, Plus, Printer, Receipt, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState, Field, Panel, Pick } from "@/components/shared";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api";
import { useLetterheads, useOffice } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import { printDocument } from "@/lib/letterhead";
import { waLink } from "@/lib/whatsapp";
import type { Case, Invoice, InvoiceIn, MarkPaidIn, PayMethod, PaymentsStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const mad = (n: number, locale: string) => new Intl.NumberFormat(locale, { style: "currency", currency: "MAD" }).format(n);
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

/** Case fees (الأتعاب): invoices, manual payment, PayPal pay link, printable invoice on the letterhead. */
export function FeesPanel({ c }: { c: Case }) {
  const { t, lang, fmtDate } = useI18n();
  const qc = useQueryClient();
  const locale = lang === "ar" ? "ar-MA" : lang === "fr" ? "fr-MA" : "en-GB";
  const list = useQuery({ queryKey: ["invoices", c.id], queryFn: () => apiGet<Invoice[]>(`/invoices?case_id=${c.id}`) });
  const pay = useQuery({ queryKey: ["payments-status"], queryFn: () => apiGet<PaymentsStatus>("/payments/status"), staleTime: 60_000 });
  const lh = useLetterheads().data?.find((l) => l.is_default);
  const logoId = useOffice().data?.logo_image_id;
  const blank: InvoiceIn = { title: t("أتعاب المحاماة", "Legal fees"), amount_mad: 0, pay_amount: 0, pay_currency: "EUR", due_date: "", notes: "" };
  const [f, setF] = useState<InvoiceIn>(blank);
  const [open, setOpen] = useState(false);
  const invalidate = () => qc.invalidateQueries({ queryKey: ["invoices", c.id] });
  const add = useMutation({
    mutationFn: () => apiPost<Invoice>(`/cases/${c.id}/invoices`, f),
    onSuccess: () => { invalidate(); setF(blank); setOpen(false); toast.success(t("أضيفت الفاتورة", "Invoice added")); },
    onError: () => toast.error(t("أدخل المبلغ بالدرهم", "Enter the amount in MAD")),
  });
  const paid = useMutation({ mutationFn: ({ id, method }: { id: string; method: PayMethod }) => apiPatch<Invoice>(`/invoices/${id}/paid`, { method } satisfies MarkPaidIn), onSuccess: invalidate });
  const del = useMutation({ mutationFn: (id: string) => apiDelete(`/invoices/${id}`), onSuccess: invalidate });
  const link = (i: Invoice) => `${window.location.origin}/pay/${i.token}`;
  const methods: Record<string, string> = { paypal: "PayPal", cash: t("نقداً", "Cash"), cheque: t("شيك", "Cheque"), transfer: t("تحويل بنكي", "Bank transfer") };

  const printInvoice = (i: Invoice) => void printDocument({
    title: `${t("فاتورة", "Invoice")} ${i.number}`, lh, logoId, rtl: lang === "ar", signature: true,
    html: `<h1 style="text-align:center">${t("فاتورة أتعاب", "Fee invoice")} ${esc(i.number)}</h1>
<p>${t("التاريخ", "Date")}: ${esc(fmtDate(i.created_at.slice(0, 10)))}</p>
<p>${t("الموكل", "Client")}: <b>${esc(i.client_name || "—")}</b> — ${t("الملف", "File")}: ${esc(i.case_file_number)}</p>
<table style="width:100%;border-collapse:collapse;margin:16px 0"><tr><th style="text-align:start;border-bottom:2px solid #B8912F;padding:6px">${t("البيان", "Description")}</th><th style="text-align:end;border-bottom:2px solid #B8912F;padding:6px">${t("المبلغ", "Amount")}</th></tr>
<tr><td style="padding:8px">${esc(i.title)}${i.notes ? `<br><small>${esc(i.notes)}</small>` : ""}</td><td style="padding:8px;text-align:end"><b>${esc(mad(i.amount_mad, locale))}</b></td></tr></table>
<p>${i.status === "paid" ? `${t("أُديت", "Paid")} (${esc(methods[i.paid_method] ?? i.paid_method)}) — ${esc(fmtDate(i.paid_at.slice(0, 10)))}` : `${t("للأداء", "Payable")}${i.due_date ? ` ${t("قبل", "by")} ${esc(fmtDate(i.due_date))}` : ""}${i.pay_amount ? ` — ${t("أداء إلكتروني", "Pay online")}: ${esc(link(i))}` : ""}`}</p>`,
  });

  const total = (list.data ?? []).reduce((a, i) => a + i.amount_mad, 0);
  const due = (list.data ?? []).filter((i) => i.status === "unpaid").reduce((a, i) => a + i.amount_mad, 0);

  return (
    <Panel data-testid="case-fees-panel">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-lg font-bold"><Receipt className="size-5 text-terra" />{t("الأتعاب", "Fees")}</h2>
        <Button size="sm" variant="outline" onClick={() => setOpen((o) => !o)} data-testid="invoice-new-button"><Plus className="size-4" />{t("فاتورة", "Invoice")}</Button>
      </div>
      {!!list.data?.length && (
        <div className="mb-3 grid grid-cols-2 gap-2 text-sm" data-testid="fees-totals">
          <div className="rounded-xl bg-paper p-2.5"><div className="text-xs text-muted-foreground">{t("المجموع", "Total")}</div><b>{mad(total, locale)}</b></div>
          <div className="rounded-xl bg-paper p-2.5"><div className="text-xs text-muted-foreground">{t("الباقي", "Outstanding")}</div><b className={cn(due > 0 && "text-amber-700")}>{mad(due, locale)}</b></div>
        </div>
      )}
      {open && (
        <div className="mb-4 space-y-3 rounded-xl border bg-paper p-3" data-testid="invoice-form">
          <Field label={t("البيان", "Description")}><Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} data-testid="invoice-title-input" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t("المبلغ (درهم)", "Amount (MAD)")}><Input type="number" min={0} step="0.01" value={f.amount_mad || ""} onChange={(e) => setF({ ...f, amount_mad: Number(e.target.value) })} data-testid="invoice-amount-input" /></Field>
            <Field label={t("آخر أجل للأداء", "Due date")}><Input type="date" value={f.due_date} onChange={(e) => setF({ ...f, due_date: e.target.value })} data-testid="invoice-due-input" /></Field>
          </div>
          <div className="grid grid-cols-[1fr_90px] gap-3">
            <Field label={t("مبلغ الأداء عبر PayPal (اختياري)", "PayPal amount (optional)")}><Input type="number" min={0} step="0.01" value={f.pay_amount || ""} onChange={(e) => setF({ ...f, pay_amount: Number(e.target.value) })} data-testid="invoice-pay-amount-input" /></Field>
            <Field label={t("العملة", "Currency")}><Pick value={f.pay_currency} onChange={(v) => setF({ ...f, pay_currency: v as InvoiceIn["pay_currency"] })} options={[{ value: "EUR", label: "EUR" }, { value: "USD", label: "USD" }]} testId="invoice-currency-select" /></Field>
          </div>
          <p className="text-xs text-muted-foreground">{t("PayPal لا يقبل الدرهم: حدد المقابل باليورو أو الدولار ليتمكن الموكل من الأداء إلكترونياً.", "PayPal doesn't accept MAD: set the EUR/USD equivalent for online payment.")}</p>
          <Button className="w-full" onClick={() => add.mutate()} disabled={add.isPending || f.amount_mad <= 0} data-testid="invoice-save-button">{t("حفظ الفاتورة", "Save invoice")}</Button>
        </div>
      )}
      {!list.data?.length ? (
        <EmptyState title={t("لا فواتير بعد", "No invoices yet")} testId="fees-empty" />
      ) : (
        <ul className="space-y-2">
          {list.data.map((i) => (
            <li key={i.id} className="rounded-xl border p-3" data-testid="invoice-row">
              <div className="flex items-center gap-2">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{i.number} — {i.title}</div>
                  <div className="text-xs text-muted-foreground">{mad(i.amount_mad, locale)}{i.pay_amount > 0 && ` · ${i.pay_amount.toFixed(2)} ${i.pay_currency}`}</div>
                </div>
                <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", i.status === "paid" ? "bg-emerald-50 text-emerald-800" : "bg-amber-100 text-amber-900")} data-testid="invoice-status">
                  {i.status === "paid" ? `${t("مؤداة", "Paid")} · ${methods[i.paid_method] ?? ""}` : t("غير مؤداة", "Unpaid")}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-1">
                {i.status === "unpaid" && (
                  <div className="w-36"><Pick value="" placeholder={t("تسجيل الأداء…", "Mark paid…")} onChange={(v) => paid.mutate({ id: i.id, method: v as PayMethod })} testId="invoice-mark-paid-select"
                    options={(["cash", "cheque", "transfer"] as const).map((m) => ({ value: m, label: methods[m] }))} /></div>
                )}
                {i.status === "unpaid" && i.pay_amount > 0 && (
                  <>
                    <Button size="sm" variant="ghost" onClick={() => { void navigator.clipboard.writeText(link(i)); toast.success(t("نُسخ رابط الأداء", "Pay link copied")); }} data-testid="invoice-copy-link"><Copy className="size-3.5" />{t("رابط الأداء", "Pay link")}</Button>
                    <a href={waLink("", t("رابط أداء الأتعاب ({n}): {l}", "Fee payment link ({n}): {l}", { n: i.number, l: link(i) }))} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-emerald-700 hover:bg-emerald-50" data-testid="invoice-whatsapp-link"><MessageCircle className="size-3.5" />WhatsApp</a>
                  </>
                )}
                <Button size="sm" variant="ghost" onClick={() => printInvoice(i)} title={t("طباعة", "Print")} data-testid="invoice-print-button"><Printer className="size-3.5" /></Button>
                <button onClick={() => { if (confirm(t("حذف الفاتورة؟", "Delete invoice?"))) del.mutate(i.id); }} className="ms-auto rounded p-1 text-muted-foreground hover:text-destructive" data-testid="invoice-delete-button"><Trash2 className="size-4" /></button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {pay.data && !pay.data.paypal_configured && (
        <p className="mt-3 rounded-lg bg-warm/60 p-2 text-xs" data-testid="paypal-inactive-note">{t("الأداء عبر PayPal جاهز وغير مفعّل بعد: يحتاج إلى Client ID و Secret من developer.paypal.com. رابط الأداء يعمل للاطلاع على الفاتورة.", "PayPal is ready but inactive until the Client ID & Secret are added; the pay link already shows the invoice.")}</p>
      )}
    </Panel>
  );
}
