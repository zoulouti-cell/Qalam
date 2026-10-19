import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FilePlus2, FileText, Stamp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, PageHeader } from "@/components/shared";
import { apiDelete, apiGet } from "@/lib/api";
import { htmlToText } from "@/lib/letterhead";
import { DOC_TYPE_LABELS, useI18n } from "@/lib/i18n";
import type { LegalDocument, Template } from "@/lib/types";

export default function Documents() {
  const { t, fmtDate } = useI18n();
  const nav = useNavigate();
  const docs = useQuery({ queryKey: ["documents", ""], queryFn: () => apiGet<LegalDocument[]>("/documents") });
  const templates = useQuery({ queryKey: ["templates"], queryFn: () => apiGet<Template[]>("/templates") });
  const rows = docs.isError ? [] : docs.data ?? [];
  const qc = useQueryClient();
  const delTpl = useMutation({ mutationFn: (key: string) => apiDelete(`/templates/${key}`), onSuccess: () => qc.invalidateQueries({ queryKey: ["templates"] }) });

  return (
    <div>
      <PageHeader
        title={t("التحرير", "Documents")}
        subtitle={t("المذكرات والعقود والمراسلات", "Memos, contracts and correspondence")}
        actions={<Button onClick={() => nav("/documents/new")} data-testid="document-new-button"><FilePlus2 className="size-4" />{t("وثيقة فارغة", "Blank document")}</Button>}
      />
      <h2 className="mb-3 text-sm font-medium text-muted-foreground">{t("ابدأ من قالب", "Start from a template")}</h2>
      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5" data-testid="doc-template-selector">
        <button onClick={() => nav("/documents/new")} data-testid="template-card-letterhead"
          className="group animate-rise rounded-2xl border border-[#D4AF37]/50 bg-ink p-5 text-start text-stone-50 transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-md">
          <div className="mb-6 grid h-24 place-items-center rounded-lg bg-[#0F2A20]"><Stamp className="size-8 text-gold" /></div>
          <div className="font-bold group-hover:text-gold">{t("صفحة على ترويسة المكتب", "Page on office letterhead")}</div>
        </button>
        {(templates.data ?? []).map((tpl, i) => (
          <div key={tpl.key} className="relative">
            <button onClick={() => nav(`/documents/new?template=${tpl.key}`)} style={{ animationDelay: `${i * 50}ms` }} data-testid={`template-card-${tpl.key}`}
              className="group h-full w-full animate-rise rounded-2xl border bg-card p-5 text-start transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-md">
              <div className="mb-6 h-24 overflow-hidden rounded-lg bg-paper p-3 text-[9px] leading-relaxed text-stone-400">{(tpl.custom ? htmlToText(tpl.content) : tpl.content).slice(0, 200)}</div>
              {tpl.custom && <span className="mb-1 inline-block rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-medium text-[#7A5F14]">{t("نموذج المكتب", "Office model")}</span>}
              <div className="font-bold group-hover:text-terra">{t(tpl.title_ar, tpl.title_en)}</div>
            </button>
            {tpl.custom && (
              <button onClick={() => { if (confirm(t("حذف هذا النموذج؟", "Delete this model?"))) delTpl.mutate(tpl.key); }} title={t("حذف النموذج", "Delete model")}
                className="absolute end-2 top-2 rounded-full bg-white/90 p-1 text-muted-foreground shadow-sm transition-colors hover:text-destructive" data-testid="template-delete-button">
                <X className="size-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>
      <h2 className="mb-3 text-lg font-bold">{t("الوثائق المحفوظة", "Saved documents")}</h2>
      {rows.length === 0 && !docs.isPending ? (
        <EmptyState title={t("لا وثائق بعد", "No documents yet")} testId="documents-empty" />
      ) : (
        <ul className="divide-y rounded-2xl border bg-card">
          {rows.map((d) => (
            <li key={d.id}>
              <button onClick={() => nav(`/documents/${d.id}`)} className="flex w-full items-center gap-4 p-4 text-start transition-colors hover:bg-warm/50" data-testid="document-list-item">
                <FileText className="size-5 text-terra" />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{d.title}</div>
                  <div className="truncate text-xs text-muted-foreground">{d.case_label || t("غير مرتبطة بملف", "Not linked to a case")}</div>
                </div>
                <span className="rounded-full bg-warm px-2.5 py-0.5 text-xs">{t(...(DOC_TYPE_LABELS[d.doc_type] ?? [d.doc_type, d.doc_type]))}</span>
                <span className="hidden text-xs text-muted-foreground sm:block">{fmtDate(d.updated_at, { day: "numeric", month: "short" })}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
