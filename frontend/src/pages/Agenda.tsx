import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Gavel, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState, PageHeader } from "@/components/shared";
import { apiGet } from "@/lib/api";
import { useLetterheads } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import { LetterheadHeader } from "@/lib/letterhead";
import type { Agenda } from "@/lib/types";

// Pure calendar arithmetic on a server-provided YYYY-MM-DD (no "today" computed in the browser).
const shift = (iso: string, days: number) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

export default function AgendaPage() {
  const { t, fmtDate } = useI18n();
  const [date, setDate] = useState(""); // "" → server's today
  const q = useQuery({ queryKey: ["agenda", date], queryFn: () => apiGet<Agenda>(`/agenda${date ? `?date=${date}` : ""}`) });
  const lh = useLetterheads().data?.find((l) => l.is_default);
  const day = q.data?.date ?? date;

  return (
    <div>
      {lh && <div className="mb-6 hidden print:block"><LetterheadHeader lh={lh} /></div>}
      <PageHeader
        title={t("جدول جلسات اليوم", "Daily hearing agenda")}
        subtitle={day ? fmtDate(day, { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "…"}
        actions={
          <div className="no-print flex flex-wrap items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => day && setDate(shift(day, -1))} title={t("اليوم السابق", "Previous day")} data-testid="agenda-prev-day"><ChevronRight className="size-4 ltr:rotate-180" /></Button>
            <Input type="date" value={day} onChange={(e) => setDate(e.target.value)} className="w-40" data-testid="agenda-date-input" />
            <Button variant="outline" size="icon" onClick={() => day && setDate(shift(day, 1))} title={t("اليوم التالي", "Next day")} data-testid="agenda-next-day"><ChevronLeft className="size-4 ltr:rotate-180" /></Button>
            <Button variant="ghost" onClick={() => setDate("")} data-testid="agenda-today-button">{t("اليوم", "Today")}</Button>
            <Button onClick={() => window.print()} disabled={!q.data?.total} data-testid="agenda-print-button"><Printer className="size-4" />{t("طباعة", "Print")}</Button>
          </div>
        }
      />

      {q.data && (
        <p className="mb-5 text-sm text-muted-foreground" data-testid="agenda-total">
          {t(`${q.data.total} جلسة في ${q.data.groups.length} محكمة`, `${q.data.total} hearing(s) across ${q.data.groups.length} court(s)`)}
        </p>
      )}

      {q.data && q.data.total === 0 ? (
        <EmptyState title={t("لا جلسات مبرمجة في هذا اليوم", "No hearings scheduled this day")} hint={t("أضف جلسة من التقويم أو من صفحة الملف باختيار النوع «جلسة».", "Add a hearing from the calendar or a case page.")} testId="agenda-empty" />
      ) : (
        <div className="space-y-6">
          {(q.data?.groups ?? []).map((g, gi) => (
            <section key={g.court} className="animate-rise overflow-hidden rounded-2xl border bg-card print:break-inside-avoid print:rounded-none print:border-stone-400" style={{ animationDelay: `${gi * 60}ms` }} data-testid="agenda-court-group">
              <header className="flex items-center gap-3 border-b bg-ink px-5 py-3 text-stone-50 print:bg-white print:text-black">
                <Gavel className="size-4 text-gold" />
                <h2 className="font-bold" data-testid="agenda-court-name">{g.court === "—" ? t("محكمة غير محددة", "Court not set") : g.court}</h2>
                <span className="ms-auto text-xs text-stone-400 print:text-stone-600">{g.items.length}</span>
              </header>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-warm/60 text-xs text-muted-foreground">
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
                        <td className="whitespace-nowrap px-4 py-3 font-mono text-terra">{it.time || "—"}</td>
                        <td className="px-4 py-3">
                          {it.case_id ? (
                            <Link to={`/cases/${it.case_id}`} className="font-medium hover:text-terra print:no-underline" data-testid="agenda-case-link">{it.file_number}</Link>
                          ) : <span className="font-medium">{it.title}</span>}
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
          ))}
        </div>
      )}
    </div>
  );
}
