import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, BookmarkPlus, FileDown, FileType2, Printer, Save, Share2, Sparkles, Square, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, Pick } from "@/components/shared";
import RichEditor from "@/components/RichEditor";
import { apiDelete, apiGet, apiPost, apiPut, apiStream, fileUrl } from "@/lib/api";
import { useCases, useLetterheads, useMe, useOffice } from "@/lib/hooks";
import { Checkbox } from "@/components/ui/checkbox";
import { DOC_TYPE_LABELS, useI18n } from "@/lib/i18n";
import { LetterheadFooter, LetterheadHeader, SignatureBlock, downloadWord, exportPdf, hasSignature, htmlToText, isPageMode, printDocument, sharePdf, textToHtml, toHtml } from "@/lib/letterhead";
import type { DocumentIn, LegalDocument, Template } from "@/lib/types";

export default function DocumentEditor() {
  const { id = "new" } = useParams();
  const [sp] = useSearchParams();
  const isNew = id === "new";
  const { t, lang } = useI18n();
  const nav = useNavigate();
  const qc = useQueryClient();
  const me = useMe();
  const cases = useCases();
  const letterheads = useLetterheads();
  const logoId = useOffice().data?.logo_image_id;
  const [withSignature, setWithSignature] = useState(true);
  const canShare = typeof navigator !== "undefined" && "canShare" in navigator;
  const [f, setF] = useState<DocumentIn>({ title: "", doc_type: "memo", content: "", case_id: sp.get("case") ?? "", letterhead_id: "" });
  const [prompt, setPrompt] = useState("");
  const [drafting, setDrafting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const existing = useQuery({ queryKey: ["document", id], queryFn: () => apiGet<LegalDocument>(`/documents/${id}`), enabled: !isNew });
  const templates = useQuery({ queryKey: ["templates"], queryFn: () => apiGet<Template[]>("/templates") });

  useEffect(() => {
    if (loaded) return;
    if (!isNew && existing.data) {
      const d = existing.data;
      setF({ title: d.title, doc_type: d.doc_type, content: toHtml(d.content), case_id: d.case_id, letterhead_id: d.letterhead_id ?? "" });
      setLoaded(true);
    } else if (isNew && templates.data && letterheads.data) {
      const tpl = templates.data.find((x) => x.key === sp.get("template"));
      const content = tpl ? (tpl.custom ? toHtml(tpl.content) : textToHtml(tpl.content)) : "";
      const lhId = sp.get("letterhead") === "none" ? "" : (letterheads.data.find((l) => l.is_default)?.id ?? "");
      setF((p) => ({ ...p, letterhead_id: lhId, ...(tpl ? { title: tpl.title_ar, doc_type: tpl.doc_type, content } : {}) }));
      setLoaded(true);
    }
  }, [existing.data, templates.data, letterheads.data, isNew, loaded, sp]);

  const lh = (letterheads.data ?? []).find((l) => l.id === f.letterhead_id) ?? null;

  const save = useMutation({
    mutationFn: () => (isNew ? apiPost<LegalDocument>("/documents", f) : apiPut<LegalDocument>(`/documents/${id}`, f)),
    onSuccess: (d) => {
      qc.invalidateQueries({ queryKey: ["documents"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.setQueryData(["document", d.id], d);
      toast.success(t("تم حفظ الوثيقة", "Document saved"));
      if (isNew) nav(`/documents/${d.id}`, { replace: true });
    },
    onError: () => toast.error(t("أدخل عنواناً للوثيقة", "Enter a document title")),
  });
  const del = useMutation({
    mutationFn: () => apiDelete(`/documents/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["documents"] }); nav("/documents"); },
  });

  const draft = async () => {
    if (!prompt.trim()) return toast.error(t("اكتب تعليمات للمساعد", "Write instructions first"));
    setDrafting(true);
    const base = f.content;
    let out = "";
    try {
      await apiStream("/documents/draft", { instructions: prompt, doc_type: t(...(DOC_TYPE_LABELS[f.doc_type] ?? [f.doc_type, f.doc_type])), case_id: f.case_id, base_content: htmlToText(base) }, (chunk) => {
        out += chunk;
        setF((p) => ({ ...p, content: textToHtml(out) }));
      });
      toast.success(t("المسودة جاهزة — راجعها قبل الحفظ", "Draft ready — review before saving"));
    } catch {
      setF((p) => ({ ...p, content: base }));
      toast.error(t("تعذر إنشاء المسودة", "Could not generate the draft"));
    } finally {
      setDrafting(false);
    }
  };

  const job = () => ({ title: f.title, html: f.content, lh, rtl: lang === "ar", logoId, signature: withSignature });
  const saveTemplate = useMutation({
    mutationFn: () => apiPost<Template>("/templates", { title: f.title || t("نموذج بدون عنوان", "Untitled model"), doc_type: f.doc_type, content: f.content }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["templates"] }); toast.success(t("حُفظ كمذكرة نموذجية في «التحرير»", "Saved as a model memo")); },
  });
  const share = async () => {
    setExporting(true);
    try {
      if (!(await sharePdf(job()))) toast.info(t("المشاركة غير متاحة على هذا الجهاز — استعمل زر PDF", "Sharing isn't available here — use the PDF button"));
    } catch {
      /* user closed the share sheet */
    } finally {
      setExporting(false);
    }
  };
  const pdf = async () => {
    setExporting(true);
    try {
      await exportPdf(job());
      toast.success(t("تم تنزيل ملف PDF", "PDF downloaded"));
    } catch {
      toast.error(t("تعذر إنشاء ملف PDF", "Could not create the PDF"));
    } finally {
      setExporting(false);
    }
  };

  return (
    <div data-testid="doc-editor-container">
      <button onClick={() => nav("/documents")} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-terra" data-testid="doc-back-link">
        <ArrowRight className="size-4 ltr:rotate-180" />{t("التحرير", "Documents")}
      </button>
      <div className="grid gap-6 xl:grid-cols-[1fr_330px]">
        <div className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder={t("عنوان الوثيقة", "Document title")}
              className="h-12 min-w-[200px] flex-1 border-0 bg-transparent text-2xl font-bold shadow-none focus-visible:ring-0" data-testid="doc-title-input" />
            <Button onClick={() => save.mutate()} disabled={save.isPending || drafting} data-testid="doc-save-button"><Save className="size-4" />{t("حفظ", "Save")}</Button>
            <Button variant="outline" onClick={() => void printDocument(job())} title={t("طباعة", "Print")} data-testid="doc-print-button"><Printer className="size-4" /></Button>
            <Button variant="outline" onClick={() => void pdf()} disabled={exporting || drafting} data-testid="doc-export-pdf-button">
              <FileDown className="size-4" />{exporting ? t("جارٍ التحضير…", "Preparing…") : "PDF"}
            </Button>
            <Button variant="outline" onClick={() => void downloadWord(job())} data-testid="doc-export-word-button"><FileType2 className="size-4" />Word</Button>
            {canShare && <Button variant="outline" onClick={() => void share()} disabled={exporting || drafting} title={t("مشاركة (واتساب، البريد…)", "Share (WhatsApp, mail…)")} data-testid="doc-share-button"><Share2 className="size-4" /></Button>}
            <Button variant="outline" onClick={() => saveTemplate.mutate()} disabled={saveTemplate.isPending || !f.content} title={t("حفظ كمذكرة نموذجية", "Save as model memo")} data-testid="doc-save-template-button"><BookmarkPlus className="size-4" /></Button>
            {!isNew && <Button variant="outline" className="text-destructive" onClick={() => { if (confirm(t("حذف الوثيقة؟", "Delete document?"))) del.mutate(); }} data-testid="doc-delete-button"><Trash2 className="size-4" /></Button>}
          </div>

          {/* A4-like sheet: letterhead header, rich editor, letterhead footer */}
          <div className="mx-auto max-w-[210mm] rounded-sm bg-white bg-[length:100%_auto] bg-top bg-no-repeat px-6 pb-8 pt-8 shadow-[0_20px_50px_-20px_rgba(11,31,24,0.35)] ring-1 ring-stone-200 sm:px-[18mm]" data-testid="doc-paper"
            style={lh && isPageMode(lh) ? { backgroundImage: `url(${fileUrl(lh.page_image_id)})`, paddingTop: `${lh.margin_top_mm}mm`, paddingBottom: `${lh.margin_bottom_mm}mm`, minHeight: "297mm" } : undefined}>
            {lh && <LetterheadHeader lh={lh} logoId={logoId} />}
            <RichEditor html={f.content} onChange={(content) => setF((p) => ({ ...p, content }))} readOnly={drafting} placeholder={t("ابدأ الكتابة هنا…", "Start writing here…")} />
            {lh && withSignature && hasSignature(lh) && <SignatureBlock lh={lh} />}
            {lh && <LetterheadFooter lh={lh} />}
          </div>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-20 xl:self-start">
          <div className="space-y-4 rounded-2xl border bg-card p-5">
            <Field label={t("نوع الوثيقة", "Document type")}>
              <Pick value={f.doc_type} onChange={(v) => setF({ ...f, doc_type: v })} testId="doc-type-select"
                options={Object.entries(DOC_TYPE_LABELS).map(([k, [ar, en]]) => ({ value: k, label: t(ar, en) }))} />
            </Field>
            <Field label={t("حفظ داخل الملف", "Save in case")}>
              <Pick value={f.case_id} onChange={(v) => setF({ ...f, case_id: v })} allowNone testId="doc-save-case-select"
                options={(cases.data ?? []).map((c) => ({ value: c.id, label: `${c.file_number} — ${c.subject}` }))} />
            </Field>
            <Field label={t("الترويسة", "Letterhead")}>
              <Pick value={f.letterhead_id} onChange={(v) => setF({ ...f, letterhead_id: v })} allowNone placeholder={t("بدون ترويسة", "No letterhead")} testId="doc-letterhead-select"
                options={(letterheads.data ?? []).map((l) => ({ value: l.id, label: l.name }))} />
            </Field>
            {lh && hasSignature(lh) && (
              <label className="flex items-center justify-between gap-3 text-sm">
                {t("إضافة التوقيع والختم", "Add signature & stamp")}
                <Checkbox checked={withSignature} onCheckedChange={(v: boolean) => setWithSignature(v)} data-testid="doc-signature-checkbox" />
              </label>
            )}
            {!letterheads.data?.length && me.data?.role === "admin" && (
              <Link to="/letterheads" className="block text-xs text-terra hover:underline" data-testid="doc-create-letterhead-link">
                + {t("أنشئ ترويسة المكتب", "Create the office letterhead")}
              </Link>
            )}
          </div>
          <div className="space-y-3 rounded-2xl bg-ink p-5 text-stone-50">
            <div className="flex items-center gap-2 font-bold"><Sparkles className="size-4 text-gold" />{t("مسودة بالذكاء الاصطناعي", "AI draft")}</div>
            <p className="text-xs leading-relaxed text-stone-400">
              {t("صف ما تريد، وسيكتب المساعد مسودة أولى مستعيناً بمعطيات الملف المختار وبالنص الحالي إن وجد.", "Describe what you need; the assistant drafts using the selected case and current text.")}
            </p>
            <Textarea rows={5} value={prompt} onChange={(e) => setPrompt(e.target.value)} className="border-emerald-900 bg-[#0F2A20] text-stone-50 placeholder:text-stone-500"
              placeholder={t("مثال: مقال افتتاحي للمطالبة بأداء واجبات كراء 6 أشهر متأخرة…", "e.g. Petition claiming 6 months of unpaid rent…")} data-testid="doc-ai-prompt-input" />
            <Button onClick={draft} disabled={drafting} className="w-full bg-gold text-ink hover:bg-[#E6C766]" data-testid="doc-ai-draft-trigger">
              {drafting ? <><Square className="size-3 animate-pulse" />{t("يكتب المساعد…", "Drafting…")}</> : <><Sparkles className="size-4" />{t("اكتب المسودة", "Write draft")}</>}
            </Button>
            <p className="text-[11px] text-stone-500">{t("المسودة مساعدة ولا تغني عن مراجعة المحامي.", "Drafts assist; they don't replace a lawyer's review.")}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
