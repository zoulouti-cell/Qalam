import { useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, CalendarPlus, FileDown, FileText, Paperclip, Pencil, Plus, Printer, Sparkles, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AppointmentFormDialog, CaseFormDialog } from "@/components/forms";
import { EmptyState, PageHeader, Panel, StatusBadge, fmtSize } from "@/components/shared";
import { CaseDeadlinesPanel, useToday } from "@/components/Deadlines";
import { FeesPanel } from "@/components/Fees";
import { caseReportHtml } from "@/lib/caseReport";
import { exportPdf, printDocument } from "@/lib/letterhead";
import { useLetterheads, useOffice } from "@/lib/hooks";
import { apiDelete, apiGet, apiPost, apiUpload, fileUrl } from "@/lib/api";
import { DOC_TYPE_LABELS, useI18n } from "@/lib/i18n";
import type { Appointment, Attachment, Case, CaseEvent, CaseEventIn, Conversation, Deadline, LegalDocument } from "@/lib/types";

export default function CaseDetail() {
  const { id = "" } = useParams();
  const { t, fmtDate, lang } = useI18n();
  const nav = useNavigate();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [edit, setEdit] = useState(false);
  const [appt, setAppt] = useState(false);
  const [ev, setEv] = useState<CaseEventIn>({ date: new Date().toISOString().slice(0, 10), title: "", details: "" });

  const cs = useQuery({ queryKey: ["case", id], queryFn: () => apiGet<Case>(`/cases/${id}`) });
  const events = useQuery({ queryKey: ["case-events", id], queryFn: () => apiGet<CaseEvent[]>(`/cases/${id}/events`) });
  const atts = useQuery({ queryKey: ["case-attachments", id], queryFn: () => apiGet<Attachment[]>(`/cases/${id}/attachments`) });
  const docs = useQuery({ queryKey: ["documents", id], queryFn: () => apiGet<LegalDocument[]>(`/documents?case_id=${id}`) });
  const appts = useQuery({ queryKey: ["appointments", "case", id], queryFn: () => apiGet<Appointment[]>(`/appointments`) });
  const c = cs.isError ? undefined : cs.data;
  const caseAppts = (appts.data ?? []).filter((a) => a.case_id === id);
  const deadlines = useQuery({ queryKey: ["deadlines", id], queryFn: () => apiGet<Deadline[]>(`/deadlines?case_id=${id}`) });
  const lh = useLetterheads().data?.find((l) => l.is_default);
  const logoId = useOffice().data?.logo_image_id;
  const today = useToday();
  const report = async (kind: "print" | "pdf") => {
    if (!c) return;
    const html = caseReportHtml(c, events.data ?? [], deadlines.data ?? [], caseAppts, docs.data ?? [], today ?? "", t, (iso) => fmtDate(iso));
    const job = { title: `${t("تقرير", "Report")} ${c.file_number}`, html, lh, rtl: lang === "ar", logoId, signature: true };
    if (kind === "print") await printDocument(job);
    else await exportPdf(job);
  };

  const addEvent = useMutation({
    mutationFn: () => apiPost<CaseEvent>(`/cases/${id}/events`, ev),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["case-events", id] }); setEv({ ...ev, title: "", details: "" }); toast.success(t("أضيف إلى السجل", "Added to log")); },
  });
  const delEvent = useMutation({
    mutationFn: (eid: string) => apiDelete(`/cases/${id}/events/${eid}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["case-events", id] }),
  });
  const upload = useMutation({
    mutationFn: (f: File) => apiUpload<Attachment>(`/cases/${id}/attachments`, f),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["case-attachments", id] }); toast.success(t("تم رفع المرفق", "File uploaded")); },
    onError: () => toast.error(t("نوع الملف غير مدعوم أو الحجم كبير", "Unsupported type or file too large")),
  });
  const delAtt = useMutation({
    mutationFn: (aid: string) => apiDelete(`/attachments/${aid}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["case-attachments", id] }),
  });
  const delCase = useMutation({
    mutationFn: () => apiDelete(`/cases/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cases"] }); nav("/cases"); },
  });
  const askAI = useMutation({
    mutationFn: () => apiPost<Conversation>("/conversations", { title: `${c?.file_number} — ${c?.subject}`, case_id: id, library_item_id: "", attachment_id: "" }),
    onSuccess: (conv) => nav(`/assistant?c=${conv.id}`),
  });

  const analyse = useMutation({
    mutationFn: (a: Attachment) => apiPost<Conversation>("/conversations", { title: `${t("تحليل", "Analysis")}: ${a.filename}`, case_id: id, library_item_id: "", attachment_id: a.id }),
    onSuccess: (conv) => nav(`/assistant?c=${conv.id}&ask=file`),
  });

  const facts: [string, string, string | undefined][] = [
    ["الموكل", "Client", c?.client_name],
    ["المحكمة", "Court", c?.court],
    ["الخصم", "Opponent", c?.opponent],
    ["المحامي المكلف", "Assigned lawyer", c?.assigned_name],
  ];

  return (
    <div>
      <Link to="/cases" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-terra" data-testid="case-back-link">
        <ArrowRight className="size-4 ltr:rotate-180" />{t("الملفات", "Cases")}
      </Link>
      <PageHeader
        title={c?.subject ?? "…"}
        subtitle={c ? `${t("ملف عدد", "File no.")} ${c.file_number}` : undefined}
        actions={
          <>
            {c && <StatusBadge status={c.status} />}
            <Button variant="outline" onClick={() => askAI.mutate()} disabled={!c} data-testid="case-ask-ai-button"><Sparkles className="size-4" />{t("اسأل المساعد", "Ask assistant")}</Button>
            <Button variant="outline" onClick={() => void report("print")} disabled={!c} title={t("طباعة تقرير الملف", "Print case report")} data-testid="case-report-print-button"><Printer className="size-4" />{t("تقرير الملف", "Case report")}</Button>
            <Button variant="outline" onClick={() => void report("pdf")} disabled={!c} title="PDF" data-testid="case-report-pdf-button"><FileDown className="size-4" /></Button>
            <Button variant="outline" onClick={() => setEdit(true)} disabled={!c} data-testid="case-edit-button"><Pencil className="size-4" />{t("تعديل", "Edit")}</Button>
            <Button variant="outline" className="text-destructive" disabled={!c} data-testid="case-delete-button"
              onClick={() => { if (confirm(t("حذف هذا الملف وسجله؟", "Delete this case and its log?"))) delCase.mutate(); }}><Trash2 className="size-4" /></Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <Panel className="grid grid-cols-2 gap-4 bg-warm/50 sm:grid-cols-4" data-testid="case-facts-panel">
            {facts.map(([ar, en, v]) => (
              <div key={en}><div className="text-xs text-muted-foreground">{t(ar, en)}</div><div className="mt-0.5 font-medium">{v || "—"}</div></div>
            ))}
            {c?.notes && <p className="col-span-full whitespace-pre-wrap text-sm leading-relaxed text-stone-700">{c.notes}</p>}
          </Panel>

          <Panel data-testid="case-log-timeline">
            <h2 className="mb-4 text-lg font-bold">{t("سجل الجلسات والإجراءات", "Hearings & procedures log")}</h2>
            <form className="mb-6 grid gap-3 rounded-xl border bg-paper p-3 sm:grid-cols-[150px_1fr_auto]" onSubmit={(e) => { e.preventDefault(); addEvent.mutate(); }}>
              <Input type="date" required value={ev.date} onChange={(e) => setEv({ ...ev, date: e.target.value })} data-testid="case-event-date-input" />
              <Input required value={ev.title} onChange={(e) => setEv({ ...ev, title: e.target.value })} placeholder={t("مثال: جلسة — تأخير للمداولة", "e.g. Hearing — deliberation")} data-testid="case-event-title-input" />
              <Button type="submit" disabled={addEvent.isPending} data-testid="case-event-add-button"><Plus className="size-4" />{t("إضافة", "Add")}</Button>
              <Textarea rows={2} className="sm:col-span-3" value={ev.details} onChange={(e) => setEv({ ...ev, details: e.target.value })} placeholder={t("تفاصيل (اختياري)", "Details (optional)")} data-testid="case-event-details-input" />
            </form>
            {events.data?.length ? (
              <ol className="relative space-y-5 border-s-2 border-[#D4AF37]/60 ps-6">
                {events.data.map((e) => (
                  <li key={e.id} className="group relative" data-testid="case-event-item">
                    <span className="absolute -start-[31px] top-1 size-3 rounded-full border-2 border-paper bg-terra" />
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-xs text-muted-foreground">{fmtDate(e.date)} · {e.created_by}</div>
                        <div className="font-medium">{e.title}</div>
                        {e.details && <p className="mt-1 whitespace-pre-wrap text-sm text-stone-600">{e.details}</p>}
                      </div>
                      <button onClick={() => delEvent.mutate(e.id)} className="opacity-0 transition-opacity group-hover:opacity-100" data-testid="case-event-delete-button"><Trash2 className="size-4 text-muted-foreground" /></button>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <EmptyState title={t("لا إجراءات مسجلة بعد", "No entries yet")} />
            )}
          </Panel>
        </div>

        <div className="space-y-6">
          <CaseDeadlinesPanel caseId={id} />
          {c && <FeesPanel c={c} />}
          <Panel data-testid="case-attachments-panel">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">{t("المرفقات", "Attachments")}</h2>
              <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()} disabled={upload.isPending} data-testid="case-upload-attachment-button">
                <Upload className="size-4" />{upload.isPending ? t("جارٍ الرفع…", "Uploading…") : t("رفع", "Upload")}
              </Button>
              <input ref={fileRef} type="file" hidden accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.txt" data-testid="case-attachment-file-input"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) upload.mutate(f); e.target.value = ""; }} />
            </div>
            {atts.data?.length ? (
              <ul className="space-y-2">
                {atts.data.map((a) => (
                  <li key={a.id} className="flex items-center gap-3 rounded-lg border p-2.5" data-testid="case-attachment-item">
                    <Paperclip className="size-4 shrink-0 text-terra" />
                    <a href={fileUrl(a.id)} target="_blank" rel="noreferrer" className="min-w-0 flex-1 truncate text-sm hover:underline" data-testid="case-attachment-link">{a.filename}</a>
                    <span className="text-xs text-muted-foreground">{fmtSize(a.size)}</span>
                    {/\.(pdf|docx|txt|png|jpe?g|webp)$/i.test(a.filename) && (
                      <button onClick={() => analyse.mutate(a)} disabled={analyse.isPending} title={t("تحليل بالمساعد", "Analyse with assistant")}
                        className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs text-terra transition-colors hover:bg-warm" data-testid="case-attachment-analyse-button">
                        <Sparkles className="size-3.5" />{t("تحليل", "Analyse")}
                      </button>
                    )}
                    <button onClick={() => delAtt.mutate(a.id)} data-testid="case-attachment-delete-button"><Trash2 className="size-4 text-muted-foreground hover:text-destructive" /></button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">{t("PDF، صور، Word", "PDF, images, Word")}</p>
            )}
          </Panel>

          <Panel data-testid="case-documents-panel">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">{t("وثائق الملف", "Case documents")}</h2>
              <Link to={`/documents/new?case=${id}`} className="text-sm text-terra hover:underline" data-testid="case-new-document-link">+ {t("وثيقة", "Document")}</Link>
            </div>
            {docs.data?.length ? (
              <ul className="space-y-2">
                {docs.data.map((d) => (
                  <li key={d.id}>
                    <Link to={`/documents/${d.id}`} className="flex items-center gap-3 rounded-lg p-2 hover:bg-warm" data-testid="case-document-link">
                      <FileText className="size-4 text-terra" />
                      <span className="flex-1 truncate text-sm">{d.title}</span>
                      <span className="text-xs text-muted-foreground">{t(...(DOC_TYPE_LABELS[d.doc_type] ?? [d.doc_type, d.doc_type]))}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">{t("لا وثائق بعد", "No documents yet")}</p>
            )}
          </Panel>

          <Panel data-testid="case-appointments-panel">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">{t("المواعيد", "Appointments")}</h2>
              <Button size="sm" variant="outline" onClick={() => setAppt(true)} data-testid="case-add-appointment-button"><CalendarPlus className="size-4" /></Button>
            </div>
            {caseAppts.length ? (
              <ul className="space-y-2 text-sm">
                {caseAppts.map((a) => (
                  <li key={a.id} className="flex justify-between gap-2 rounded-lg bg-paper p-2" data-testid="case-appointment-item">
                    <span>{a.title}</span><span className="text-muted-foreground">{fmtDate(a.date, { day: "numeric", month: "short" })} {a.time}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">{t("لا مواعيد", "None")}</p>
            )}
          </Panel>
        </div>
      </div>
      <CaseFormDialog open={edit} onOpenChange={setEdit} initial={c} />
      <AppointmentFormDialog open={appt} onOpenChange={setAppt} defaults={{ case_id: id, client_id: c?.client_id ?? "", kind: "hearing", location: c?.court ?? "" }} />
    </div>
  );
}
