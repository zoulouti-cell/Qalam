import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CalendarClock, FileText, FolderOpen, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppointmentFormDialog, CaseFormDialog, ClientFormDialog } from "@/components/forms";
import { EmptyState, PageHeader, Panel, StatusBadge } from "@/components/shared";
import { apiGet } from "@/lib/api";
import { useMe } from "@/lib/hooks";
import { KIND_LABELS, useI18n } from "@/lib/i18n";
import type { Appointment, Dashboard as DashboardData } from "@/lib/types";
import { cn } from "@/lib/utils";

export function AppointmentRow({ a, showDate, highlight }: { a: Appointment; showDate?: boolean; highlight?: boolean }) {
  const { t, fmtDate } = useI18n();
  const [ar, en] = KIND_LABELS[a.kind];
  return (
    <li className={cn("flex items-start gap-4 rounded-xl border p-3 transition-colors hover:bg-warm", highlight && "border-[#D4AF37] bg-[#FFF7ED]")} data-testid="appointment-row">
      <div className="w-16 shrink-0 text-center">
        <div className="font-mono text-lg font-medium" dir="ltr">{a.time || "—"}</div>
        {showDate && <div className="text-xs text-muted-foreground">{fmtDate(a.date, { day: "numeric", month: "short" })}</div>}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">{a.title}</span>
          <span className={cn("rounded-full px-2 py-0.5 text-[11px]", a.kind === "hearing" ? "bg-ink text-stone-50" : "bg-warm text-stone-700")}>{t(ar, en)}</span>
        </div>
        <div className="mt-1 truncate text-sm text-muted-foreground">
          {[a.location, a.client_name, a.case_label].filter(Boolean).join(" · ")}
        </div>
      </div>
    </li>
  );
}

export default function Dashboard() {
  const { t, fmtDate } = useI18n();
  const me = useMe();
  const q = useQuery({ queryKey: ["dashboard"], queryFn: () => apiGet<DashboardData>("/dashboard") });
  const d = q.isError ? undefined : q.data;
  const [dlg, setDlg] = useState<"" | "client" | "case" | "appt">("");

  const stats = [
    { icon: FolderOpen, ar: "ملفات نشطة", en: "Active cases", v: d?.stats.active_cases, id: "stats-active-cases" },
    { icon: CalendarClock, ar: "مواعيد اليوم", en: "Today", v: d?.stats.today_count, id: "stats-hearings-today" },
    { icon: Users, ar: "الموكلون", en: "Clients", v: d?.stats.clients, id: "stats-clients" },
    { icon: FileText, ar: "الوثائق", en: "Documents", v: d?.stats.documents, id: "stats-documents" },
  ];

  return (
    <div data-testid="dashboard-overview">
      <PageHeader
        title={t(`مرحباً، ${me.data?.name?.split(" ")[0] ?? ""}`, `Welcome, ${me.data?.name?.split(" ")[0] ?? ""}`)}
        subtitle={d ? fmtDate(d.today, { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : undefined}
        actions={
          <>
            <Button variant="outline" onClick={() => setDlg("client")} data-testid="quick-action-new-client"><Plus className="size-4" />{t("موكل", "Client")}</Button>
            <Button variant="outline" onClick={() => setDlg("appt")} data-testid="quick-action-new-appointment"><Plus className="size-4" />{t("موعد", "Appointment")}</Button>
            <Button onClick={() => setDlg("case")} data-testid="quick-action-new-case"><Plus className="size-4" />{t("ملف جديد", "New case")}</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s, i) => (
          <div key={s.id} className={cn("animate-rise rounded-2xl border p-5", i === 0 ? "bg-ink text-stone-50" : "bg-card")} style={{ animationDelay: `${i * 60}ms` }} data-testid={s.id}>
            <s.icon className={cn("size-5", i === 0 ? "text-[#D4AF37]" : "text-terra")} />
            <div className="mt-4 text-4xl font-bold tabular-nums">{s.v ?? "—"}</div>
            <div className={cn("mt-1 text-sm", i === 0 ? "text-stone-300" : "text-muted-foreground")}>{t(s.ar, s.en)}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <Panel data-testid="today-appointments-panel">
            <h2 className="mb-4 text-lg font-bold">{t("مواعيد وجلسات اليوم", "Today's schedule")}</h2>
            {d?.today_appointments.length ? (
              <ul className="space-y-2">{d.today_appointments.map((a) => <AppointmentRow key={a.id} a={a} highlight />)}</ul>
            ) : (
              <EmptyState title={t("لا مواعيد اليوم", "Nothing scheduled today")} testId="today-empty" />
            )}
          </Panel>
          <Panel data-testid="hearings-upcoming-list">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">{t("الأيام السبعة القادمة", "Next 7 days")}</h2>
              <Link to="/calendar" className="text-sm text-terra hover:underline" data-testid="dashboard-calendar-link">{t("التقويم", "Calendar")}</Link>
            </div>
            {d?.week_appointments.length ? (
              <ul className="space-y-2">{d.week_appointments.map((a) => <AppointmentRow key={a.id} a={a} showDate />)}</ul>
            ) : (
              <EmptyState title={t("لا مواعيد قادمة هذا الأسبوع", "No upcoming appointments")} />
            )}
          </Panel>
        </div>
        <div className="space-y-6">
          <Panel data-testid="active-cases-panel">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">{t("الملفات النشطة", "Active cases")}</h2>
              <Link to="/cases" className="text-sm text-terra hover:underline" data-testid="dashboard-cases-link">{t("الكل", "All")}</Link>
            </div>
            {d?.active_cases.length ? (
              <ul className="divide-y">
                {d.active_cases.map((c) => (
                  <li key={c.id}>
                    <Link to={`/cases/${c.id}`} className="flex items-center justify-between gap-3 py-3 transition-colors hover:text-terra" data-testid="dashboard-case-link">
                      <div className="min-w-0">
                        <div className="truncate font-medium">{c.subject}</div>
                        <div className="font-mono text-xs text-muted-foreground" dir="ltr">{c.file_number}</div>
                      </div>
                      <StatusBadge status={c.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState title={t("لا ملفات نشطة", "No active cases")} />
            )}
          </Panel>
          <Panel data-testid="activity-panel">
            <h2 className="mb-4 text-lg font-bold">{t("آخر النشاطات", "Recent activity")}</h2>
            {d?.activity.length ? (
              <ol className="relative space-y-4 border-s ps-5">
                {d.activity.map((a) => (
                  <li key={a.id} className="relative" data-testid="activity-item">
                    <span className="absolute -start-[25px] top-1.5 size-2.5 rounded-full bg-terra" />
                    <div className="text-sm"><span className="font-medium">{a.user_name}</span> · {a.label}</div>
                    <div className="text-xs text-muted-foreground">{fmtDate(a.created_at, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</div>
                  </li>
                ))}
              </ol>
            ) : (
              <EmptyState title={t("لا نشاط بعد", "No activity yet")} />
            )}
          </Panel>
        </div>
      </div>

      <ClientFormDialog open={dlg === "client"} onOpenChange={(o) => !o && setDlg("")} />
      <CaseFormDialog open={dlg === "case"} onOpenChange={(o) => !o && setDlg("")} />
      <AppointmentFormDialog open={dlg === "appt"} onOpenChange={(o) => !o && setDlg("")} defaults={{ date: d?.today ?? "" }} />
    </div>
  );
}
