import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, Pick } from "@/components/shared";
import { apiPost, apiPut } from "@/lib/api";
import { useCases, useClients, useTeam } from "@/lib/hooks";
import { KIND_LABELS, STATUS_LABELS, useI18n } from "@/lib/i18n";
import { COURTS, formatPhone } from "@/lib/morocco";
import type { Appointment, AppointmentIn, Case, CaseIn, Client, ClientIn } from "@/lib/types";

interface DialogProps<T> { open: boolean; onOpenChange: (o: boolean) => void; initial?: T | null }

function useSave<T>(path: string, id: string | undefined, keys: string[][], done: () => void) {
  const qc = useQueryClient();
  const { t } = useI18n();
  return useMutation({
    mutationFn: (body: unknown) => (id ? apiPut<T>(`${path}/${id}`, body) : apiPost<T>(path, body)),
    onSuccess: () => {
      keys.forEach((k) => qc.invalidateQueries({ queryKey: k }));
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success(t("تم الحفظ", "Saved"));
      done();
    },
    onError: () => toast.error(t("تعذر الحفظ، تحقق من الحقول", "Could not save — check the fields")),
  });
}

// ---------------- Client ----------------
const EMPTY_CLIENT: ClientIn = { name: "", phone: "", email: "", address: "", id_number: "", notes: "" };

export function ClientFormDialog({ open, onOpenChange, initial }: DialogProps<Client>) {
  const { t } = useI18n();
  const [f, setF] = useState<ClientIn>(EMPTY_CLIENT);
  useEffect(() => { if (open) setF(initial ? { ...EMPTY_CLIENT, ...initial } : EMPTY_CLIENT); }, [open, initial]);
  const save = useSave<Client>("/clients", initial?.id, [["clients"], ["client"]], () => onOpenChange(false));
  const set = (k: keyof ClientIn) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" data-testid="client-form-dialog">
        <DialogHeader><DialogTitle>{initial ? t("تعديل الموكل", "Edit client") : t("موكل جديد", "New client")}</DialogTitle></DialogHeader>
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); save.mutate(f); }}>
          <Field label={t("الاسم الكامل", "Full name")} className="sm:col-span-2"><Input required value={f.name} onChange={set("name")} data-testid="client-form-name-input" /></Field>
          <Field label={t("الهاتف", "Phone")}><Input value={f.phone} onChange={set("phone")} onBlur={() => setF((p) => ({ ...p, phone: formatPhone(p.phone) }))} dir="ltr" placeholder="+212 6XX XX XX XX" data-testid="client-form-phone-input" /></Field>
          <Field label={t("البريد الإلكتروني", "Email")}><Input type="email" value={f.email} onChange={set("email")} dir="ltr" data-testid="client-form-email-input" /></Field>
          <Field label={t("رقم البطاقة الوطنية", "National ID (CNIE)")}><Input value={f.id_number} onChange={set("id_number")} data-testid="client-form-id-input" /></Field>
          <Field label={t("العنوان", "Address")}><Input value={f.address} onChange={set("address")} data-testid="client-form-address-input" /></Field>
          <Field label={t("ملاحظات", "Notes")} className="sm:col-span-2"><Textarea rows={3} value={f.notes} onChange={set("notes")} data-testid="client-form-notes-input" /></Field>
          <DialogFooter className="sm:col-span-2">
            <Button type="submit" disabled={save.isPending} data-testid="client-form-submit-button">{t("حفظ", "Save")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---------------- Case ----------------
const EMPTY_CASE: CaseIn = { file_number: "", subject: "", court: "", opponent: "", status: "ongoing", client_id: "", assigned_to: "", notes: "" };

export function CaseFormDialog({ open, onOpenChange, initial, defaultClientId }: DialogProps<Case> & { defaultClientId?: string }) {
  const { t } = useI18n();
  const clients = useClients();
  const team = useTeam();
  const [f, setF] = useState<CaseIn>(EMPTY_CASE);
  useEffect(() => {
    if (open) setF(initial ? { ...EMPTY_CASE, ...initial } : { ...EMPTY_CASE, client_id: defaultClientId ?? "" });
  }, [open, initial, defaultClientId]);
  const save = useSave<Case>("/cases", initial?.id, [["cases"], ["case"], ["client-cases"]], () => onOpenChange(false));
  const set = (k: keyof CaseIn) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl" data-testid="case-form-dialog">
        <DialogHeader><DialogTitle>{initial ? t("تعديل الملف", "Edit case") : t("ملف جديد", "New case")}</DialogTitle></DialogHeader>
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); save.mutate(f); }}>
          <Field label={t("رقم الملف", "File number")}><Input required value={f.file_number} onChange={set("file_number")} placeholder="2026/1201/45" dir="ltr" data-testid="case-form-number-input" /></Field>
          <Field label={t("الحالة", "Status")}>
            <Pick value={f.status} onChange={(v) => setF({ ...f, status: v as CaseIn["status"] })} testId="case-form-status-select"
              options={Object.entries(STATUS_LABELS).map(([k, [ar, en]]) => ({ value: k, label: t(ar, en) }))} />
          </Field>
          <Field label={t("الموضوع", "Subject")} className="sm:col-span-2"><Input required value={f.subject} onChange={set("subject")} data-testid="case-form-subject-input" /></Field>
          <Field label={t("المحكمة", "Court")}><Input value={f.court} onChange={set("court")} list="ma-courts" placeholder={t("اختر أو اكتب: المحكمة الابتدائية بـ…", "Pick or type a court")} data-testid="case-form-court-input" />
            <datalist id="ma-courts">{COURTS.map((c) => <option key={c} value={c} />)}</datalist></Field>
          <Field label={t("الخصم", "Opponent")}><Input value={f.opponent} onChange={set("opponent")} data-testid="case-form-opponent-input" /></Field>
          <Field label={t("الموكل", "Client")}>
            <Pick value={f.client_id} onChange={(v) => setF({ ...f, client_id: v })} allowNone testId="case-form-client-select"
              options={(clients.data ?? []).map((c) => ({ value: c.id, label: c.name }))} />
          </Field>
          <Field label={t("المحامي المكلف", "Assigned lawyer")}>
            <Pick value={f.assigned_to} onChange={(v) => setF({ ...f, assigned_to: v })} allowNone testId="case-form-assignee-select"
              options={(team.data ?? []).map((u) => ({ value: u.user_id, label: u.name || u.email }))} />
          </Field>
          <Field label={t("ملاحظات", "Notes")} className="sm:col-span-2"><Textarea rows={3} value={f.notes} onChange={set("notes")} data-testid="case-form-notes-input" /></Field>
          <DialogFooter className="sm:col-span-2">
            <Button type="submit" disabled={save.isPending} data-testid="case-form-submit-button">{t("حفظ", "Save")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---------------- Appointment ----------------
const EMPTY_APPT: AppointmentIn = { title: "", kind: "meeting", date: "", time: "", location: "", client_id: "", case_id: "", notes: "" };

export function AppointmentFormDialog({ open, onOpenChange, initial, defaults }: DialogProps<Appointment> & { defaults?: Partial<AppointmentIn> }) {
  const { t } = useI18n();
  const clients = useClients();
  const cases = useCases();
  const [f, setF] = useState<AppointmentIn>(EMPTY_APPT);
  useEffect(() => {
    if (open) setF(initial ? { ...EMPTY_APPT, ...initial } : { ...EMPTY_APPT, ...defaults });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial]);
  const save = useSave<Appointment>("/appointments", initial?.id, [["appointments"]], () => onOpenChange(false));
  const set = (k: keyof AppointmentIn) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });
  const pickCase = (id: string) => {
    const c = cases.data?.find((x) => x.id === id);
    setF({ ...f, case_id: id, client_id: c?.client_id || f.client_id, location: f.location || c?.court || "" });
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl" data-testid="appointment-form-dialog">
        <DialogHeader><DialogTitle>{initial ? t("تعديل الموعد", "Edit appointment") : t("موعد جديد", "New appointment")}</DialogTitle></DialogHeader>
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); save.mutate(f); }}>
          <Field label={t("العنوان", "Title")} className="sm:col-span-2"><Input required value={f.title} onChange={set("title")} data-testid="appointment-form-title-input" /></Field>
          <Field label={t("النوع", "Type")}>
            <Pick value={f.kind} onChange={(v) => setF({ ...f, kind: v as AppointmentIn["kind"] })} testId="appointment-form-kind-select"
              options={Object.entries(KIND_LABELS).map(([k, [ar, en]]) => ({ value: k, label: t(ar, en) }))} />
          </Field>
          <Field label={t("المكان", "Location")}><Input value={f.location} onChange={set("location")} data-testid="appointment-form-location-input" /></Field>
          <Field label={t("التاريخ", "Date")}><Input required type="date" value={f.date} onChange={set("date")} data-testid="appointment-form-date-input" /></Field>
          <Field label={t("الساعة", "Time")}><Input type="time" value={f.time} onChange={set("time")} data-testid="appointment-form-time-input" /></Field>
          <Field label={t("الملف", "Case")}>
            <Pick value={f.case_id} onChange={pickCase} allowNone testId="appointment-form-case-select"
              options={(cases.data ?? []).map((c) => ({ value: c.id, label: `${c.file_number} — ${c.subject}` }))} />
          </Field>
          <Field label={t("الموكل", "Client")}>
            <Pick value={f.client_id} onChange={(v) => setF({ ...f, client_id: v })} allowNone testId="appointment-form-client-select"
              options={(clients.data ?? []).map((c) => ({ value: c.id, label: c.name }))} />
          </Field>
          <Field label={t("ملاحظات", "Notes")} className="sm:col-span-2"><Textarea rows={2} value={f.notes} onChange={set("notes")} data-testid="appointment-form-notes-input" /></Field>
          <DialogFooter className="sm:col-span-2">
            <Button type="submit" disabled={save.isPending} data-testid="appointment-form-submit-button">{t("حفظ", "Save")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
