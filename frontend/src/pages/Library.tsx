import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Paperclip, Plus, Search, Sparkles, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState, Field, PageHeader, Pick } from "@/components/shared";
import { apiDelete, apiGet, apiPost, apiUpload, fileUrl } from "@/lib/api";
import { DOMAIN_LABELS, SECTION_LABELS, useI18n } from "@/lib/i18n";
import type { Conversation, LibraryItem, LibraryItemIn } from "@/lib/types";
import { cn } from "@/lib/utils";

const EMPTY: LibraryItemIn = { title: "", section: "texts", domain: "civil", reference: "", date: "", content: "" };

function ItemForm({ open, onOpenChange, section }: { open: boolean; onOpenChange: (o: boolean) => void; section: string }) {
  const { t } = useI18n();
  const qc = useQueryClient();
  const [f, setF] = useState<LibraryItemIn>(EMPTY);
  const [file, setFile] = useState<File | null>(null);
  useEffect(() => { if (open) { setF({ ...EMPTY, section: (section || "texts") as LibraryItemIn["section"] }); setFile(null); } }, [open, section]);
  const save = useMutation({
    mutationFn: async () => {
      const item = await apiPost<LibraryItem>("/library", f);
      if (file) await apiUpload(`/library/${item.id}/attachments`, file);
      return item;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["library"] }); toast.success(t("أضيفت المادة", "Item added")); onOpenChange(false); },
    onError: () => toast.error(t("تعذر الحفظ", "Could not save")),
  });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl" data-testid="library-form-dialog">
        <DialogHeader><DialogTitle>{t("مادة جديدة في المكتبة", "New library item")}</DialogTitle></DialogHeader>
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
          <Field label={t("العنوان", "Title")} className="sm:col-span-2"><Input required value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} data-testid="library-form-title-input" /></Field>
          <Field label={t("القسم", "Section")}>
            <Pick value={f.section} onChange={(v) => setF({ ...f, section: v as LibraryItemIn["section"] })} testId="library-form-section-select"
              options={Object.entries(SECTION_LABELS).map(([k, [ar, en]]) => ({ value: k, label: t(ar, en) }))} />
          </Field>
          <Field label={t("المجال", "Domain")}>
            <Pick value={f.domain} onChange={(v) => setF({ ...f, domain: v })} testId="library-form-domain-select"
              options={Object.entries(DOMAIN_LABELS).map(([k, [ar, en]]) => ({ value: k, label: t(ar, en) }))} />
          </Field>
          <Field label={t("المرجع", "Reference")}><Input value={f.reference} onChange={(e) => setF({ ...f, reference: e.target.value })} placeholder={t("ظهير، قرار عدد…", "Dahir, decision no.…")} data-testid="library-form-reference-input" /></Field>
          <Field label={t("التاريخ", "Date")}><Input type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} data-testid="library-form-date-input" /></Field>
          <Field label={t("النص الكامل", "Full text")} className="sm:col-span-2"><Textarea rows={8} value={f.content} onChange={(e) => setF({ ...f, content: e.target.value })} data-testid="library-form-content-input" /></Field>
          <Field label={t("ملف مرفق (اختياري)", "Attached file (optional)")} className="sm:col-span-2">
            <Input type="file" accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.txt" onChange={(e) => setFile(e.target.files?.[0] ?? null)} data-testid="library-form-file-input" />
          </Field>
          <DialogFooter className="sm:col-span-2"><Button type="submit" disabled={save.isPending} data-testid="library-form-submit-button">{t("حفظ", "Save")}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function Library() {
  const { t, fmtDate } = useI18n();
  const nav = useNavigate();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [section, setSection] = useState("");
  const [domain, setDomain] = useState("");
  const [adding, setAdding] = useState(false);
  const [reading, setReading] = useState<LibraryItem | null>(null);
  const list = useQuery({
    queryKey: ["library", q, section, domain],
    queryFn: () => apiGet<LibraryItem[]>(`/library?q=${encodeURIComponent(q)}&section=${section}&domain=${domain}`),
  });
  const rows = list.isError ? [] : list.data ?? [];
  const del = useMutation({
    mutationFn: (id: string) => apiDelete(`/library/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["library"] }); setReading(null); },
  });
  const attach = useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => apiUpload(`/library/${id}/attachments`, file),
    onSuccess: async (_, v) => {
      await qc.invalidateQueries({ queryKey: ["library"] });
      setReading(await apiGet<LibraryItem>(`/library/${v.id}`));
    },
  });
  const ask = useMutation({
    mutationFn: (it: LibraryItem) => apiPost<Conversation>("/conversations", { title: it.title, library_item_id: it.id, case_id: "" }),
    onSuccess: (c) => nav(`/assistant?c=${c.id}`),
  });

  const sections = [["", "الكل", "All"], ...Object.entries(SECTION_LABELS).map(([k, [ar, en]]) => [k, ar, en])];

  return (
    <div>
      <div className="relative mb-8 overflow-hidden rounded-3xl">
        <img src="https://images.pexels.com/photos/8731036/pexels-photo-8731036.jpeg?auto=compress&cs=tinysrgb&h=650&w=940" alt="" className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(28,25,23,0.92)_0%,rgba(41,37,36,0.8)_100%)]" />
        <div className="relative flex flex-wrap items-end justify-between gap-4 p-8 text-stone-50 sm:p-10">
          <div>
            <h1 className="text-3xl font-bold sm:text-4xl" data-testid="page-title">{t("المكتبة القانونية", "Legal library")}</h1>
            <p className="mt-2 max-w-lg text-stone-300">{t("النصوص القانونية والاجتهادات القضائية والدراسات الخاصة بالمكتب.", "The office's legal texts, case law and studies.")}</p>
          </div>
          <Button onClick={() => setAdding(true)} className="bg-[#FDBA74] text-ink hover:bg-[#FED7AA]" data-testid="library-add-button"><Plus className="size-4" />{t("إضافة مادة", "Add item")}</Button>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1 rounded-xl border bg-card p-1" data-testid="library-section-tabs">
          {sections.map(([k, ar, en]) => (
            <button key={k || "all"} onClick={() => setSection(k)} data-testid={`library-section-${k || "all"}`}
              className={cn("rounded-lg px-3 py-1.5 text-sm transition-colors", section === k ? "bg-ink text-stone-50" : "text-muted-foreground hover:bg-warm")}>{t(ar, en)}</button>
          ))}
        </div>
        <div className="relative min-w-60 flex-1">
          <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("ابحث في العناوين والنصوص والمراجع", "Search titles, texts and references")} className="h-10 bg-card ps-9" data-testid="library-search-input" />
        </div>
        <div className="w-44">
          <Pick value={domain} onChange={setDomain} allowNone placeholder={t("كل المجالات", "All domains")} testId="library-domain-filter"
            options={Object.entries(DOMAIN_LABELS).map(([k, [ar, en]]) => ({ value: k, label: t(ar, en) }))} />
        </div>
      </div>

      {rows.length === 0 && !list.isPending ? (
        <EmptyState title={t("لا توجد مواد مطابقة", "No matching items")} hint={t("أضف نصوصاً أو اجتهادات أو دراسات", "Add texts, case law or studies")} testId="library-empty" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {rows.map((it, i) => (
            <button key={it.id} onClick={() => setReading(it)} style={{ animationDelay: `${i * 30}ms` }} data-testid="library-article-card"
              className="group animate-rise rounded-2xl border bg-card p-5 text-start transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full bg-ink px-2.5 py-0.5 text-stone-50">{t(...SECTION_LABELS[it.section])}</span>
                <span className="rounded-full bg-warm px-2.5 py-0.5 text-terra">{t(...(DOMAIN_LABELS[it.domain] ?? [it.domain, it.domain]))}</span>
                {it.attachments.length > 0 && <Paperclip className="size-3.5 text-muted-foreground" />}
              </div>
              <h3 className="font-bold leading-snug group-hover:text-terra">{it.title}</h3>
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{it.content}</p>
              <div className="mt-3 text-xs text-muted-foreground">{[it.reference, it.date && fmtDate(it.date)].filter(Boolean).join(" · ")}</div>
            </button>
          ))}
        </div>
      )}

      <Dialog open={!!reading} onOpenChange={(o) => !o && setReading(null)}>
        <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-3xl" data-testid="library-read-modal">
          {reading && (
            <>
              <DialogHeader>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-ink px-2.5 py-0.5 text-stone-50">{t(...SECTION_LABELS[reading.section])}</span>
                  <span className="rounded-full bg-warm px-2.5 py-0.5 text-terra">{t(...(DOMAIN_LABELS[reading.domain] ?? [reading.domain, reading.domain]))}</span>
                </div>
                <DialogTitle className="text-2xl leading-snug">{reading.title}</DialogTitle>
                <p className="text-sm text-muted-foreground">{[reading.reference, reading.date && fmtDate(reading.date)].filter(Boolean).join(" · ")}</p>
              </DialogHeader>
              <article className="whitespace-pre-wrap rounded-xl bg-paper p-5 text-[16px] leading-[2]" data-testid="library-read-content">{reading.content || "—"}</article>
              {reading.attachments.length > 0 && (
                <ul className="space-y-1">
                  {reading.attachments.map((a) => (
                    <li key={a.id}><a href={fileUrl(a.id)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-terra hover:underline" data-testid="library-attachment-link"><Paperclip className="size-4" />{a.filename}</a></li>
                  ))}
                </ul>
              )}
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => ask.mutate(reading)} disabled={ask.isPending} data-testid="library-cite-button"><Sparkles className="size-4" />{t("اسأل المساعد عن هذه المادة", "Ask the assistant about this")}</Button>
                <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={attach.isPending} data-testid="library-attach-button"><Upload className="size-4" />{t("إرفاق ملف", "Attach file")}</Button>
                <input ref={fileRef} type="file" hidden accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.txt"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) attach.mutate({ id: reading.id, file: f }); e.target.value = ""; }} />
                <Button variant="outline" className="ms-auto text-destructive" onClick={() => { if (confirm(t("حذف المادة؟", "Delete item?"))) del.mutate(reading.id); }} data-testid="library-delete-button"><Trash2 className="size-4" /></Button>
              </div>
              <DialogFooter />
            </>
          )}
        </DialogContent>
      </Dialog>
      <ItemForm open={adding} onOpenChange={setAdding} section={section} />
    </div>
  );
}
