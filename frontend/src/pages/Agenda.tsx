import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Gavel, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState, PageHeader, Pick } from "@/components/shared";
import { apiGet } from "@/lib/api";
import { useLetterheads, useMe, useOffice } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import { LetterheadHeader } from "@/lib/letterhead";
import { hijri, holidayOn } from "@/lib/morocco";
import type { Agenda, AgendaGroup, User } from "@/lib/types";
import { cn } from "@/lib/utils";

// Pure calendar arithmetic on a server-provided YYYY-MM-DD (no "today" computed in the browser).
const shift = (iso: string, days: number) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

function CourtGroup({ g, delay }: { g: AgendaGroup; delay: number }) {
  const { t } = useI18n();
  return (
    <section className="animate-rise overflow-hidden rounded-2xl border bg-card print:break-inside-avoid print:rounded-none print:border-stone-400" style={{ animationDelay: `${delay}ms` }} data-testid="agenda-court-group">
      <header className="flex items-center gap-3 border-b bg-ink px-5 py-3 text-stone-50 print:bg-white print:text-black">
        <Gavel className="size-4 text-gold" />
        <h3 className="font-bold" data-testid="agenda-court-name">{g.court === "—" ? t("محكمة غير محددة", "Court not set") : g.court}</h3>
        <span className="ms-auto text-xs text-stone-400 print:text-stone-600">{g.items.length}</span>
      </header>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-paper text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-2 text-start font-medium">{t("الساعة", "Time")}</th>
              <th className="px-4 py-2 text-start font-medium">{t("الملف", "File")}</th>
              <th className="px-4 py-2 text-start font-medium">{t("الأطراف", "Parties")}</th>
              <th className="px-4 py-2 text-start font-medium">{t("آخر إجراء", "Last step")}</th>
              <th className="w-40 px-4 py-2 text-start font-medium">{t("القرار / ملاحظة", "Outcome / note")}</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {g.items.map((it) => (
              <tr key={it.appointment_id} className="align-top" data-testid="agenda-hearing-row">
                <td className="whitespace-nowrap px-4 py-3 font-mono text-terra" dir="ltr">{it.time || "—"}</td>
                <td className="px-4 py-3">
                  {it.case_id ? <Link to={`/cases/${it.case_id}`} className="font-medium hover:text-terra" data-testid="agenda-case-link">{it.file_number}</Link> : <span className="font-medium">{it.title}</span>}
                  <div className="text-xs text-muted-foreground">{it.subject || it.title}</div>
                  {it.location && it.location !== g.court && <div className="text-xs text-muted-foreground">{it.location}</div>}
                </td>
                <td className="px-4 py-3">
                  <div>{it.client_name || "—"}</div>
                  {it.opponent && <div className="text-xs text-muted-foreground">{t("ضد", "v.")} {it.opponent}</div>}
                </td>
                <td className="px-4 py-3 text-xs text-stone-600">{it.last_event || "—"}</td>
                <td className="px-4 py-3"><div className="h-8 border-b border-dashed border-stone-300" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function AgendaPage() {
  const { t, fmtDate, lang } = useI18n();
  const me = useMe().data;
  const team = useQuery({ queryKey: ["team"], queryFn: () => apiGet<User[]>("/team"), enabled: me?.role === "admin" });
  const [date, setDate] = useState(""); // "" → server's today
  const [mode, setMode] = useState<"day" | "week">("day");
  const [lawyer, setLawyer] = useState("");
  const qs = (d: string) => new URLSearchParams({ ...(d ? { [mode === "day" ? "date" : "start"]: d } : {}), ...(lawyer ? { lawyer } : {}) }).toString();
  const day = useQuery({ queryKey: ["agenda", date, lawyer], queryFn: () => apiGet<Agenda>(`/agenda?${qs(date)}`), enabled: mode === "day" });
  const week = useQuery({ queryKey: ["agenda-week", date, lawyer], queryFn: () => apiGet<Agenda[]>(`/agenda/week?${qs(date)}`), enabled: mode === "week" });
  const lh = useLetterheads().data?.find((l) => l.is_default);
  const logoId = useOffice().data?.logo_image_id;
  const days: Agenda[] = mode === "day" ? (day.data ? [day.data] : []) : week.data ?? [];
  const anchor = days[0]?.date ?? date;
  const total = days.reduce((n, a) => n + a.total, 0);
  const step = mode === "day" ? 1 : 7;
  const lawyerOptions = [
    ...(me ? [{ value: me.user_id, label: t("ملفاتي فقط", "My cases only") }] : []),
    ...(me?.role === "admin" ? (team.data ?? []).filter((u) => u.user_id !== me.user_id).map((u) => ({ value: u.user_id, label: u.name || u.email })) : []),
  ];
  const range = mode === "day"
    ? fmtDate(anchor, { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    : days.length ? `${fmtDate(days[0].date, { day: "numeric", month: "long" })} — ${fmtDate(days[days.length - 1].date, { day: "numeric", month: "long", year: "numeric" })}` : "";

  return (
    <div>
      {lh && <div className="mb-6 hidden print:block"><LetterheadHeader lh={lh} logoId={logoId} /></div>}
      <PageHeader
        title={mode === "day" ? t("جدول جلسات اليوم", "Daily hearing agenda") : t("الجدول الأسبوعي للجلسات", "Weekly hearing schedule")}
        subtitle={anchor ? `${range}${mode === "day" ? `  •  ${hijri(anchor, lang)}` : ""}` : "…"}
        actions={
          <div className="no-print flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-lg border bg-card p-0.5">
              {(["day", "week"] as const).map((m) => (
                <button key={m} onClick={() => setMode(m)} data-testid={`agenda-mode-${m}`}
                  className={cn("rounded-md px-3 py-1 text-sm transition-colors duration-150", mode === m ? "bg-ink text-[#E6C766]" : "text-muted-foreground hover:text-ink")}>
                  {m === "day" ? t("يوم", "Day") : t("أسبوع", "Week")}
                </button>
              ))}
            </div>
            <div className="w-44">
              <Pick value={lawyer} onChange={setLawyer} allowNone placeholder={t("كل المحامين", "All lawyers")} options={lawyerOptions} testId="agenda-lawyer-select" />
            </div>
            <Button variant="outline" size="icon" onClick={() => anchor && setDate(shift(anchor, -step))} title={t("السابق", "Previous")} data-testid="agenda-prev-day"><ChevronRight className="size-4 ltr:rotate-180" /></Button>
            <Input type="date" value={anchor} onChange={(e) => setDate(e.target.value)} className="w-40" data-testid="agenda-date-input" />
            <Button variant="outline" size="icon" onClick={() => anchor && setDate(shift(anchor, step))} title={t("التالي", "Next")} data-testid="agenda-next-day"><ChevronLeft className="size-4 ltr:rotate-180" /></Button>
            <Button variant="ghost" onClick={() => setDate("")} data-testid="agenda-today-button">{t("اليوم", "Today")}</Button>
            <Button onClick={() => window.print()} disabled={!total} data-testid="agenda-print-button"><Printer className="size-4" />{t("طباعة", "Print")}</Button>
          </div>
        }
      />

      {days.length > 0 && (
        <p className="mb-5 text-sm text-muted-foreground" data-testid="agenda-total">
          {t("{n} جلسة", "{n} hearing(s)", { n: total })}
        </p>
      )}

      {mode === "day" && days.length > 0 && total === 0 ? (
        <EmptyState title={t("لا جلسات مبرمجة في هذه الفترة", "No hearings scheduled in this period")} hint={t("أضف جلسة من التقويم أو من صفحة الملف باختيار النوع «جلسة».", "Add a hearing from the calendar or a case page.")} testId="agenda-empty" />
      ) : mode === "day" ? (
        <div className="space-y-6">{(days[0]?.groups ?? []).map((g, i) => <CourtGroup key={g.court} g={g} delay={i * 60} />)}</div>
      ) : (
        <div className="space-y-8">
          {days.map((a) => {
            const hol = holidayOn(a.date);
            return (
              <div key={a.date} data-testid="agenda-week-day" className="print:break-inside-avoid">
                <h2 className="mb-3 flex flex-wrap items-baseline gap-3 border-b pb-2 font-bold">
                  {fmtDate(a.date, { weekday: "long", day: "numeric", month: "long" })}
                  <span className="text-xs font-normal text-muted-foreground">{hijri(a.date, lang)}</span>
                  {hol && <span className="rounded bg-[#D4AF37]/20 px-2 py-0.5 text-xs font-medium text-[#7A5F14]">{hol[lang]}</span>}
                  <span className="ms-auto text-xs font-normal text-muted-foreground">{a.total ? t("{n} جلسة", "{n} hearing(s)", { n: a.total }) : t("لا جلسات", "No hearings")}</span>
                </h2>
                <div className="space-y-4">{a.groups.map((g, i) => <CourtGroup key={g.court} g={g} delay={i * 40} />)}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
