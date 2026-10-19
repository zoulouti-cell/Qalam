import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CalendarClock, FolderOpen, Loader2, Receipt } from "lucide-react";
import LangToggle from "@/components/LangToggle";
import { StatusBadge } from "@/components/shared";
import { apiGet } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { hijri } from "@/lib/morocco";
import type { ClientPortal } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Public client portal (no login): the client's cases, upcoming hearings and invoices. */
export default function PortalPage() {
  const { token = "" } = useParams();
  const { t, lang, fmtDate } = useI18n();
  const q = useQuery({ queryKey: ["portal", token], queryFn: () => apiGet<ClientPortal>(`/portal/${token}`), retry: false });
  const d = q.data;
  const locale = lang === "ar" ? "ar-MA" : lang === "fr" ? "fr-MA" : "en-GB";
  const mad = (n: number) => new Intl.NumberFormat(locale, { style: "currency", currency: "MAD" }).format(n);
  const upcoming = (d?.cases ?? []).flatMap((c) => c.hearings.map((h) => ({ ...h, file: c.file_number, court: c.court }))).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  return (
    <div className="min-h-screen bg-paper">
      <header className="bg-ink text-stone-50">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-5 py-4">
          {d?.office_logo_id ? <img src={`/api/portal/${token}/logo`} alt="" className="h-10 w-auto rounded bg-white/90 p-1" /> : <img src="/brand/qalam-badge.png" alt="" className="size-10 rounded-full" />}
          <div className="min-w-0 flex-1">
            <div className="truncate font-bold text-[#E6C766]">{d?.office_name || t("مكتب المحاماة", "Law office")}</div>
            <div className="text-xs text-stone-400">{t("فضاء الموكل", "Client space")}</div>
          </div>
          <LangToggle className="border-white/20 bg-white/5" />
        </div>
      </header>
      <main className="mx-auto max-w-3xl space-y-6 px-5 py-6" data-testid="portal-page">
        {q.isError ? (
          <p className="py-20 text-center text-muted-foreground" data-testid="portal-not-found">{t("هذا الرابط غير صالح أو تم إلغاؤه. تواصل مع المكتب.", "This link is invalid or was revoked. Please contact the office.")}</p>
        ) : !d ? (
          <Loader2 className="mx-auto mt-20 size-6 animate-spin text-terra" />
        ) : (
          <>
            <div>
              <h1 className="text-2xl font-bold" data-testid="portal-client-name">{t("مرحباً", "Welcome")}{lang === "ar" ? "، " : ", "}{d.client_name}</h1>
              <p className="text-sm text-muted-foreground">{fmtDate(d.today, { weekday: "long", day: "numeric", month: "long", year: "numeric" })} · {hijri(d.today, lang)}</p>
            </div>

            <section className="rounded-2xl border bg-card p-5" data-testid="portal-hearings">
              <h2 className="mb-3 flex items-center gap-2 font-bold"><CalendarClock className="size-5 text-terra" />{t("الجلسات المقبلة", "Upcoming hearings")}</h2>
              {upcoming.length === 0 ? <p className="text-sm text-muted-foreground">{t("لا جلسات مبرمجة حالياً", "No hearings scheduled")}</p> : (
                <ul className="space-y-2">
                  {upcoming.map((h, i) => (
                    <li key={i} className="flex items-center gap-3 rounded-xl bg-paper p-3" data-testid="portal-hearing-row">
                      <div className="rounded-lg bg-ink px-2.5 py-1.5 text-center text-[#E6C766]"><div className="text-lg font-bold leading-none">{h.date.slice(8)}</div><div className="text-[10px]">{fmtDate(h.date, { month: "short" })}</div></div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium">{h.title}</div>
                        <div className="text-xs text-muted-foreground">{fmtDate(h.date, { weekday: "long" })}{h.time && ` · ${h.time}`} · {h.court || h.location} · {t("ملف", "File")} {h.file}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {d.cases.map((c) => (
              <section key={c.file_number} className="rounded-2xl border bg-card p-5" data-testid="portal-case">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <FolderOpen className="size-5 text-terra" />
                  <h2 className="font-bold">{c.file_number} — {c.subject}</h2>
                  <span className="ms-auto"><StatusBadge status={c.status} /></span>
                </div>
                <p className="mb-3 text-sm text-muted-foreground">{c.court}{c.opponent && ` · ${t("ضد", "v.")} ${c.opponent}`}</p>
                {c.events.length > 0 && (
                  <ol className="relative space-y-3 border-s-2 border-[#D4AF37]/40 ps-4">
                    {c.events.map((e, i) => (
                      <li key={i} className="relative" data-testid="portal-event">
                        <span className="absolute -start-[23px] top-1.5 size-3 rounded-full border-2 border-white bg-[#B8912F]" />
                        <div className="text-xs text-muted-foreground">{fmtDate(e.date)}</div>
                        <div className="text-sm">{e.title}</div>
                      </li>
                    ))}
                  </ol>
                )}
              </section>
            ))}

            {d.invoices.length > 0 && (
              <section className="rounded-2xl border bg-card p-5" data-testid="portal-invoices">
                <h2 className="mb-3 flex items-center gap-2 font-bold"><Receipt className="size-5 text-terra" />{t("الفواتير", "Invoices")}</h2>
                <ul className="space-y-2">
                  {d.invoices.map((i) => (
                    <li key={i.number} className="flex flex-wrap items-center gap-3 rounded-xl bg-paper p-3" data-testid="portal-invoice-row">
                      <div className="min-w-0 flex-1"><div className="text-sm font-medium">{i.number} — {i.title}</div><div className="text-xs text-muted-foreground">{mad(i.amount_mad)}</div></div>
                      <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", i.status === "paid" ? "bg-emerald-50 text-emerald-800" : "bg-amber-100 text-amber-900")}>{i.status === "paid" ? t("مؤداة", "Paid") : t("غير مؤداة", "Unpaid")}</span>
                      {i.pay_token && <Link to={`/pay/${i.pay_token}`} className="rounded-lg bg-[#FFC439] px-3 py-1 text-xs font-bold text-[#003087]" data-testid="portal-invoice-pay-link">{t("أداء", "Pay")}</Link>}
                    </li>
                  ))}
                </ul>
              </section>
            )}
            <p className="text-center text-xs text-muted-foreground">{t("للاستفسار تواصل مباشرة مع المكتب. هذه الصفحة خاصة بك، فلا تشاركها.", "For questions contact the office directly. This page is private — don't share it.")}</p>
          </>
        )}
      </main>
    </div>
  );
}
