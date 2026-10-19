import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { addDays, addMonths, addWeeks, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameMonth, startOfMonth, startOfWeek } from "date-fns";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppointmentFormDialog } from "@/components/forms";
import { PageHeader } from "@/components/shared";
import { apiGet } from "@/lib/api";
import { KIND_LABELS, LOCALES, useI18n } from "@/lib/i18n";
import { holidayOn } from "@/lib/morocco";
import type { Appointment, Dashboard } from "@/lib/types";
import { cn } from "@/lib/utils";

const iso = (d: Date) => format(d, "yyyy-MM-dd");

export default function CalendarPage() {
  const { t, lang, fmtDate } = useI18n();
  const [view, setView] = useState<"month" | "week">("month");
  const [cursor, setCursor] = useState(() => new Date());
  const [dlg, setDlg] = useState<{ open: boolean; initial?: Appointment | null; date?: string }>({ open: false });
  // "today" is anchored server-side (office timezone); the dashboard query already carries it.
  const dash = useQuery({ queryKey: ["dashboard"], queryFn: () => apiGet<Dashboard>("/dashboard") });
  const today = dash.data?.today ?? iso(new Date());
  const soonLimit = iso(addDays(new Date(`${today}T00:00:00`), 2));

  const days = useMemo(() => {
    const opts = { weekStartsOn: 1 as const };
    const start = view === "month" ? startOfWeek(startOfMonth(cursor), opts) : startOfWeek(cursor, opts);
    const end = view === "month" ? endOfWeek(endOfMonth(cursor), opts) : endOfWeek(cursor, opts);
    return eachDayOfInterval({ start, end });
  }, [cursor, view]);
  const start = iso(days[0]);
  const end = iso(days[days.length - 1]);
  const appts = useQuery({ queryKey: ["appointments", start, end], queryFn: () => apiGet<Appointment[]>(`/appointments?start=${start}&end=${end}`) });
  const byDay = useMemo(() => {
    const m: Record<string, Appointment[]> = {};
    for (const a of appts.isError ? [] : appts.data ?? []) (m[a.date] ??= []).push(a);
    return m;
  }, [appts.data, appts.isError]);

  const move = (n: number) => setCursor((c) => (view === "month" ? addMonths(c, n) : addWeeks(c, n)));
  const weekdayNames = days.slice(0, 7).map((d) => d.toLocaleDateString(LOCALES[lang], { weekday: "short" }));
  const title = view === "month"
    ? cursor.toLocaleDateString(LOCALES[lang], { month: "long", year: "numeric" })
    : `${fmtDate(start, { day: "numeric", month: "short" })} – ${fmtDate(end, { day: "numeric", month: "short", year: "numeric" })}`;

  const chip = (a: Appointment) => {
    const soon = a.date >= today && a.date <= soonLimit;
    return (
      <button key={a.id} onClick={(e) => { e.stopPropagation(); setDlg({ open: true, initial: a }); }} data-testid="calendar-hearing-item"
        className={cn("block w-full truncate rounded-md px-1.5 py-1 text-start text-[11px] leading-tight transition-transform hover:scale-[1.02]",
          a.kind === "hearing" ? "bg-ink text-stone-50" : "bg-[#FFEDD5] text-[#7C2D12]", soon && "ring-2 ring-[#F97316]")}>
        {a.time && <span className="font-mono" dir="ltr">{a.time} </span>}{a.title}
      </button>
    );
  };

  return (
    <div>
      <PageHeader
        title={t("المواعيد والجلسات", "Appointments & hearings")}
        actions={<Button onClick={() => setDlg({ open: true, initial: null, date: today })} data-testid="calendar-add-event-button"><Plus className="size-4" />{t("موعد جديد", "New appointment")}</Button>}
      />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => move(-1)} data-testid="calendar-prev-button"><ChevronRight className="size-4 ltr:rotate-180" /></Button>
          <Button variant="outline" size="icon" onClick={() => move(1)} data-testid="calendar-next-button"><ChevronLeft className="size-4 ltr:rotate-180" /></Button>
          <Button variant="ghost" onClick={() => setCursor(new Date(`${today}T00:00:00`))} data-testid="calendar-today-button">{t("اليوم", "Today")}</Button>
          <h2 className="ms-2 text-xl font-bold" data-testid="calendar-title">{title}</h2>
        </div>
        <div className="flex gap-1 rounded-xl border bg-card p-1" data-testid="calendar-view-toggle">
          {(["month", "week"] as const).map((v) => (
            <button key={v} onClick={() => setView(v)} data-testid={`calendar-view-${v}`}
              className={cn("rounded-lg px-4 py-1.5 text-sm transition-colors", view === v ? "bg-ink text-stone-50" : "text-muted-foreground hover:bg-warm")}>
              {v === "month" ? t("شهري", "Month") : t("أسبوعي", "Week")}
            </button>
          ))}
        </div>
      </div>
      <div className="mb-3 flex gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="size-3 rounded bg-ink" />{t(...KIND_LABELS.hearing)}</span>
        <span className="flex items-center gap-1.5"><span className="size-3 rounded bg-[#FFEDD5]" />{t(...KIND_LABELS.meeting)}</span>
        <span className="flex items-center gap-1.5"><span className="size-3 rounded ring-2 ring-[#F97316]" />{t("قريب (48 ساعة)", "Upcoming (48h)")}</span>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card animate-rise" data-testid="calendar-month-grid">
        <div className="grid grid-cols-7 border-b bg-warm/60">
          {weekdayNames.map((n) => <div key={n} className="p-2 text-center text-xs font-medium text-muted-foreground">{n}</div>)}
        </div>
        <div className="grid grid-cols-7">
          {days.map((d) => {
            const key = iso(d);
            const list = byDay[key] ?? [];
            const isToday = key === today;
            return (
              <div key={key} onClick={() => setDlg({ open: true, initial: null, date: key })} data-testid={`calendar-day-${key}`}
                className={cn("cursor-pointer border-b border-e p-1.5 transition-colors hover:bg-paper",
                  view === "month" ? "min-h-28" : "min-h-80", view === "month" && !isSameMonth(d, cursor) && "bg-stone-50/60 text-stone-400")}>
                <div className="mb-1 flex items-center gap-1">
                  <div className={cn("grid size-7 shrink-0 place-items-center rounded-full text-sm", isToday && "bg-terra font-bold text-white")}>{d.getDate()}</div>
                  {holidayOn(key) && (
                    <span className="truncate rounded bg-[#D4AF37]/20 px-1.5 py-0.5 text-[10px] font-medium text-[#7A5F14]" title={holidayOn(key)?.[lang]} data-testid="calendar-holiday-badge">
                      {holidayOn(key)?.[lang]}
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  {(view === "month" ? list.slice(0, 3) : list).map(chip)}
                  {view === "month" && list.length > 3 && <div className="px-1 text-[11px] text-muted-foreground">+{list.length - 3}</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <AppointmentFormDialog open={dlg.open} onOpenChange={(o) => setDlg({ ...dlg, open: o })} initial={dlg.initial} defaults={{ date: dlg.date }} />
    </div>
  );
}
