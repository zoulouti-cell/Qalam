import { useEffect, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import LangToggle from "@/components/LangToggle";
import { apiGet, apiPost } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import type { InvoicePublic, PayLink } from "@/lib/types";

/** Public pay page for a fee invoice (no login): shows the invoice and pays it with PayPal. */
export default function PayPage() {
  const { token = "" } = useParams();
  const [sp, setSp] = useSearchParams();
  const { t, lang, fmtDate } = useI18n();
  const qc = useQueryClient();
  const inv = useQuery({ queryKey: ["pay", token], queryFn: () => apiGet<InvoicePublic>(`/pay/${token}`), retry: false });
  const start = useMutation({
    mutationFn: () => apiPost<PayLink>(`/pay/${token}/paypal`),
    onSuccess: (r) => (r.approve_url ? window.location.assign(r.approve_url) : toast.error(t("تعذر بدء الأداء", "Could not start payment"))),
    onError: () => toast.error(t("تعذر بدء الأداء", "Could not start payment")),
  });
  const capture = useMutation({
    mutationFn: (orderId: string) => apiPost<InvoicePublic>(`/pay/${token}/capture?order_id=${encodeURIComponent(orderId)}`),
    onSuccess: (d) => { qc.setQueryData(["pay", token], d); setSp({}, { replace: true }); },
    onError: () => toast.error(t("لم يكتمل الأداء", "Payment was not completed")),
  });
  const once = useRef(false);
  useEffect(() => {
    const order = sp.get("token"); // PayPal appends ?token=<order id>&PayerID=… on return
    if (sp.get("paid") && order && !once.current) { once.current = true; capture.mutate(order); }
  }, [sp, capture]);

  const d = inv.data;
  const locale = lang === "ar" ? "ar-MA" : lang === "fr" ? "fr-MA" : "en-GB";
  return (
    <div className="grid min-h-screen place-items-center bg-paper p-5">
      <div className="w-full max-w-md">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2"><img src="/brand/qalam-badge.png" alt="" className="size-9 rounded-full" /><span className="font-bold">{d?.office_name || t("قلم", "Qalam")}</span></div>
          <LangToggle />
        </div>
        <div className="rounded-2xl border bg-card p-6 shadow-sm" data-testid="pay-card">
          {inv.isError ? <p className="text-center text-muted-foreground" data-testid="pay-not-found">{t("الرابط غير صالح", "Invalid link")}</p> : !d ? <Loader2 className="mx-auto size-6 animate-spin text-terra" /> : (
            <>
              <div className="text-xs text-muted-foreground">{t("فاتورة", "Invoice")} {d.number}</div>
              <h1 className="mt-1 text-xl font-bold" data-testid="pay-title">{d.title}</h1>
              <div className="mt-1 text-sm text-muted-foreground">{d.client_name}{d.case_file_number && ` · ${t("ملف", "File")} ${d.case_file_number}`}</div>
              <div className="my-5 rounded-xl bg-ink p-4 text-center text-stone-50">
                <div className="text-3xl font-bold text-[#E6C766]" data-testid="pay-amount">{new Intl.NumberFormat(locale, { style: "currency", currency: "MAD" }).format(d.amount_mad)}</div>
                {d.pay_amount > 0 && <div className="mt-1 text-sm text-stone-300">≈ {d.pay_amount.toFixed(2)} {d.pay_currency}</div>}
                {d.due_date && <div className="mt-1 text-xs text-stone-400">{t("قبل", "Due")} {fmtDate(d.due_date)}</div>}
              </div>
              {d.status === "paid" ? (
                <p className="flex items-center justify-center gap-2 font-medium text-emerald-700" data-testid="pay-status-paid"><CheckCircle2 className="size-5" />{t("تم الأداء، شكراً لكم", "Paid — thank you")}</p>
              ) : capture.isPending ? (
                <p className="flex items-center justify-center gap-2 text-sm"><Loader2 className="size-4 animate-spin" />{t("جارٍ تأكيد الأداء…", "Confirming payment…")}</p>
              ) : d.paypal_enabled ? (
                <Button className="h-12 w-full bg-[#FFC439] text-base font-bold text-[#003087] hover:bg-[#F2BA36]" onClick={() => start.mutate()} disabled={start.isPending} data-testid="pay-paypal-button">
                  {t("الأداء عبر PayPal", "Pay with PayPal")}
                </Button>
              ) : (
                <p className="text-center text-sm text-muted-foreground" data-testid="pay-offline-note">{t("للأداء، المرجو التواصل مع المكتب (نقداً، شيك أو تحويل بنكي).", "To pay, please contact the office (cash, cheque or bank transfer).")}</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
