import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Download, Printer, Save, Sparkles, Square, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, Pick } from "@/components/shared";
import { apiDelete, apiGet, apiPost, apiPut, apiStream } from "@/lib/api";
import { useCases } from "@/lib/hooks";
import { DOC_TYPE_LABELS, useI18n } from "@/lib/i18n";
import type { DocumentIn, LegalDocument, Template } from "@/lib/types";

function printableHtml(title: string, content: string, rtl: boolean) {
  const esc = content.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  return `<!doctype html><html dir="${rtl ? "rtl" : "ltr"}"><head><meta charset="utf-8"><title>${title}</title>
<style>body{font-family:'IBM Plex Sans Arabic','Traditional Arabic',serif;font-size:15pt;line-height:1.9;margin:2.5cm;white-space:pre-wrap;color:#111}</style></head><body>${esc}</body></html>`;
}

export default function DocumentEditor() {
  const { id = "new" } = useParams();
  const [sp] = useSearchParams();
  const isNew = id === "new";
  const { t, lang } = useI18n();
  const nav = useNavigate();
  const qc = useQueryClient();
  const cases = useCases();
  const [f, setF] = useState<DocumentIn>({ title: "", doc_type: "memo", content: "", case_id: sp.get("case") ?? "" });
  const [prompt, setPrompt] = useState("");
  const [drafting, setDrafting] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const existing = useQuery({ queryKey: ["document", id], queryFn: () => apiGet<LegalDocument>(`/documents/${id}`), enabled: !isNew });
  const templates = useQuery({ queryKey: ["templates"], queryFn: () => apiGet<Template[]>("/templates") });

  useEffect(() => {
    if (loaded) return;
    if (!isNew && existing.data) {
      const d = existing.data;
      setF({ title: d.title, doc_type: d.doc_type, content: d.content, case_id: d.case_id });
      setLoaded(true);
    } else if (isNew && templates.data) {
      const tpl = templates.data.find((x) => x.key === sp.get("template"));
      if (tpl) setF((p) => ({ ...p, title: tpl.title_ar, doc_type: tpl.doc_type, content: tpl.content }));
      setLoaded(true);
    }
  }, [existing.data, templates.data, isNew, loaded, sp]);

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
      await apiStream("/documents/draft", { instructions: prompt, doc_type: t(...(DOC_TYPE_LABELS[f.doc_type] ?? [f.doc_type, f.doc_type])), case_id: f.case_id, base_content: base }, (chunk) => {
        out += chunk;
        setF((p) => ({ ...p, content: out }));
      });
      toast.success(t("المسودة جاهزة — راجعها قبل الحفظ", "Draft ready — review before saving"));
    } catch {
      setF((p) => ({ ...p, content: base }));
      toast.error(t("تعذر إنشاء المسودة", "Could not generate the draft"));
    } finally {
      setDrafting(false);
    }
  };

  const print = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(printableHtml(f.title, f.content, lang === "ar"));
    w.document.close();
    w.focus();
    w.print();
  };
  const download = () => {
    const blob = new Blob(["\ufeff", printableHtml(f.title, f.content, lang === "ar")], { type: "application/msword" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${f.title || "document"}.doc`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div data-testid="doc-editor-container">
      <button onClick={() => nav("/documents")} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-terra" data-testid="doc-back-link">
        <ArrowRight className="size-4 ltr:rotate-180" />{t("التحرير", "Documents")}
      </button>
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder={t("عنوان الوثيقة", "Document title")}
              className="h-12 flex-1 border-0 bg-transparent text-2xl font-bold shadow-none focus-visible:ring-0" data-testid="doc-title-input" />
            <Button onClick={() => save.mutate()} disabled={save.isPending || drafting} data-testid="doc-save-button"><Save className="size-4" />{t("حفظ", "Save")}</Button>
            <Button variant="outline" onClick={print} data-testid="doc-print-button"><Printer className="size-4" /></Button>
            <Button variant="outline" onClick={download} data-testid="doc-export-pdf-button"><Download className="size-4" />Word</Button>
            {!isNew && <Button variant="outline" className="text-destructive" onClick={() => { if (confirm(t("حذف الوثيقة؟", "Delete document?"))) del.mutate(); }} data-testid="doc-delete-button"><Trash2 className="size-4" /></Button>}
          </div>
          <div className="rounded-2xl border bg-white p-2 shadow-[0_10px_30px_-12px_rgba(28,25,23,0.15)]">
            <Textarea
              value={f.content}
              onChange={(e) => setF({ ...f, content: e.target.value })}
              readOnly={drafting}
              placeholder={t("ابدأ الكتابة هنا…", "Start writing here…")}
              className="min-h-[70vh] resize-y border-0 px-8 py-8 text-[17px] leading-[2] shadow-none focus-visible:ring-0 sm:px-14"
              data-testid="doc-content-textarea"
            />
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
          </div>
          <div className="space-y-3 rounded-2xl bg-ink p-5 text-stone-50">
            <div className="flex items-center gap-2 font-bold"><Sparkles className="size-4 text-[#FDBA74]" />{t("مسودة بالذكاء الاصطناعي", "AI draft")}</div>
            <p className="text-xs leading-relaxed text-stone-400">
              {t("صف ما تريد، وسيكتب المساعد مسودة أولى مستعيناً بمعطيات الملف المختار وبالنص الحالي إن وجد.", "Describe what you need; the assistant drafts using the selected case and current text.")}
            </p>
            <Textarea rows={5} value={prompt} onChange={(e) => setPrompt(e.target.value)} className="border-stone-700 bg-stone-900 text-stone-50 placeholder:text-stone-500"
              placeholder={t("مثال: مقال افتتاحي للمطالبة بأداء واجبات كراء 6 أشهر متأخرة…", "e.g. Petition claiming 6 months of unpaid rent…")} data-testid="doc-ai-prompt-input" />
            <Button onClick={draft} disabled={drafting} className="w-full bg-[#FDBA74] text-ink hover:bg-[#FED7AA]" data-testid="doc-ai-draft-trigger">
              {drafting ? <><Square className="size-3 animate-pulse" />{t("يكتب المساعد…", "Drafting…")}</> : <><Sparkles className="size-4" />{t("اكتب المسودة", "Write draft")}</>}
            </Button>
            <p className="text-[11px] text-stone-500">{t("المسودة مساعدة ولا تغني عن مراجعة المحامي.", "Drafts assist; they don't replace a lawyer's review.")}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
