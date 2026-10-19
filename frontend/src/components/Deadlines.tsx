import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlarmClock, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { EmptyState, Field, Panel, Pick } from "@/components/shared";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api";
import { DEADLINE_RULES, computeDue, daysUntil } from "@/lib/deadlines";
import { useI18n } from "@/lib/i18n";
import type { Dashboard, Deadline, DeadlineIn } from "@/lib/types";
import { cn } from "@/lib/utils";

export function DueBadge({ today, due, done }: { today?: string; due: string; done?: boolean }) {
  const { t } = useI18n();
  if (done) return <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-500">{t("أنجز", "Done")}</span>;
  if (!today) return null;
  const n = daysUntil(today, due);
  const cls = n < 0 ? "bg-red-100 text-red-800" : n <= 3 ? "bg-amber-100 text-amber-900" : "bg-emerald-50 text-emerald-800";
  const label = n < 0 ? t("متجاوز بـ {n} يوم", "Overdue by {n} d", { n: -n }) : n === 0 ? t("اليوم", "Today") : t("بعد {n} يوم", "In {n} d", { n });
  return <span className={cn("whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium", cls)} data-testid="deadline-due-badge">{label}</span>;
}

export function useToday() {
  return useQuery({ queryKey: ["dashboard"], queryFn: () => apiGet<Dashboard>("/dashboard") }).data?.today;
}

/** Case page panel: compute and track appeal / cassation / opposition deadlines. */
export function CaseDeadlinesPanel({ caseId }: { caseId: string }) {
  const { t, fmtDate } = useI18n();
  const qc = useQueryClient();
  const today = useToday();
  const list = useQuery({ queryKey: ["deadlines", caseId], queryFn: () => apiGet<Deadline[]>(`/deadlines?case_id=${caseId}`) });
  const [kind, setKind] = useState("appeal");
  const [notified, setNotified] = useState("");
  const [days, setDays] = useState(30);
  const [label, setLabel] = useState("");
  const [override, setOverride] = useState("");
  const rule = DEADLINE_RULES.find((r) => r.key === kind)!;
  const computed = useMemo(() => computeDue(notified, days), [notified, days]);
  const due = override || computed;
  const invalidate = () => { qc.invalidateQueries({ queryKey: ["deadlines"] }); qc.invalidateQueries({ queryKey: ["dashboard"] }); };

  const add = useMutation({
    mutationFn: () => apiPost<Deadline>(`/cases/${caseId}/deadlines`, {
      kind, label: label || t(rule.ar, rule.en), notified_on: notified, days, due_date: due, notes: rule.ref,
    } satisfies DeadlineIn),
    onSuccess: () => { invalidate(); setNotified(""); setOverride(""); setLabel(""); toast.success(t("أضيف الأجل", "Deadline added")); },
    onError: () => toast.error(t("حدد تاريخ التبليغ أو تاريخ الأجل", "Set the notification or due date")),
  });
  const toggle = useMutation({ mutationFn: (d: Deadline) => apiPatch<Deadline>(`/deadlines/${d.id}`, { done: !d.done }), onSuccess: invalidate });
  const del = useMutation({ mutationFn: (id: string) => apiDelete(`/deadlines/${id}`), onSuccess: invalidate });

  return (
    <Panel data-testid="case-deadlines-panel">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold"><AlarmClock className="size-5 text-terra" />{t("آجال الطعن", "Appeal deadlines")}</h2>
      <div className="mb-4 space-y-3 rounded-xl border bg-paper p-3">
        <Field label={t("نوع الأجل", "Deadline type")}>
          <Pick value={kind} testId="deadline-kind-select"
            onChange={(v) => { const r = DEADLINE_RULES.find((x) => x.key === v)!; setKind(v); setDays(r.days); setOverride(""); }}
            options={DEADLINE_RULES.map((r) => ({ value: r.key, label: `${t(r.ar, r.en)}${r.days && r.key !== "custom" ? ` — ${r.days} ${t("يوماً", "days")}` : ""}` }))} />
        </Field>
        {kind === "custom" && <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder={t("وصف الأجل", "Deadline label")} data-testid="deadline-label-input" />}
        <div className="grid grid-cols-[1fr_90px] gap-3">
          <Field label={t("تاريخ التبليغ", "Notification date")}><Input type="date" value={notified} onChange={(e) => { setNotified(e.target.value); setOverride(""); }} data-testid="deadline-notified-input" /></Field>
          <Field label={t("المدة (يوم)", "Days")}><Input type="number" min={0} value={days} onChange={(e) => { setDays(Number(e.target.value)); setOverride(""); }} data-testid="deadline-days-input" /></Field>
        </div>
        <Field label={t("آخر أجل للطعن", "Last day to file")}>
          <Input type="date" value={due} onChange={(e) => setOverride(e.target.value)} data-testid="deadline-due-input" />
        </Field>
        {computed && !override && (
          <p className="text-xs leading-relaxed text-muted-foreground" data-testid="deadline-computed-hint">
            {t("محسوب كآجال كاملة (ف 512 ق.م.م): لا يُحتسب يوم التبليغ ولا اليوم الأخير، ويُمدد الأجل إلى أول يوم عمل بعد العطل ونهاية الأسبوع.", "Full-day computation (art. 512 CPC), extended past weekends and public holidays.")}
            {rule.ref && <span className="ms-1 font-medium">{rule.ref}</span>}
          </p>
        )}
        <Button className="w-full" onClick={() => add.mutate()} disabled={!due || add.isPending} data-testid="deadline-add-button"><Plus className="size-4" />{t("إضافة الأجل", "Add deadline")}</Button>
      </div>
      {!list.data?.length ? (
        <EmptyState title={t("لا آجال مسجلة", "No deadlines")} testId="case-deadlines-empty" />
      ) : (
        <ul className="space-y-2">
          {list.data.map((d) => (
            <li key={d.id} className={cn("flex items-center gap-3 rounded-xl border p-3", d.done && "opacity-60")} data-testid="deadline-row">
              <Checkbox checked={d.done} onCheckedChange={() => toggle.mutate(d)} data-testid="deadline-done-checkbox" />
              <div className="min-w-0 flex-1">
                <div className={cn("truncate text-sm font-medium", d.done && "line-through")}>{d.label}</div>
                <div className="text-xs text-muted-foreground">{fmtDate(d.due_date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}{d.notes && ` · ${d.notes}`}</div>
              </div>
              <DueBadge today={today} due={d.due_date} done={d.done} />
              <button onClick={() => del.mutate(d.id)} className="rounded p-1 text-muted-foreground hover:text-destructive" title={t("حذف", "Delete")} data-testid="deadline-delete-button"><Trash2 className="size-4" /></button>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
