import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FileUp, ImagePlus, PenLine, Plus, Save, Star, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { EmptyState, Field, PageHeader, Pick } from "@/components/shared";
import { apiDelete, apiPost, apiPut, apiUpload, fileUrl } from "@/lib/api";
import { useLetterheads, useOffice } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import { LetterheadFooter, LetterheadHeader, SignatureBlock, hasSignature } from "@/lib/letterhead";
import type { ImageSlot, Letterhead, LetterheadIn } from "@/lib/types";
import { cn } from "@/lib/utils";

const BLANK: LetterheadIn = {
  name: "ترويسة المكتب",
  office_name: "مكتب الأستاذ(ة) ............",
  subtitle: "محامٍ بهيئة ............ — مقبول لدى محكمة النقض",
  address: "............، المغرب",
  phone: "+212 ............",
  email: "",
  footer_text: "",
  align: "center",
  is_default: false,
  show_office_logo: false,
  signer_name: "",
  margin_top_mm: 45,
  margin_bottom_mm: 30,
};

function ImageSlotControl({ lh, slot, label, pdf }: { lh: Letterhead; slot: ImageSlot; label: string; pdf?: boolean }) {
  const { t } = useI18n();
  const qc = useQueryClient();
  const ref = useRef<HTMLInputElement>(null);
  const current = lh[`${slot}_image_id`];
  const done = (d: Letterhead) => qc.setQueryData<Letterhead[]>(["letterheads"], (old) => (old ?? []).map((x) => (x.id === d.id ? d : x)));
  const up = useMutation({
    mutationFn: (file: File) => apiUpload<Letterhead>(`/letterheads/${lh.id}/image?slot=${slot}`, file),
    onSuccess: (d) => { done(d); toast.success(t("تم رفع الصورة", "Image uploaded")); },
    onError: () => toast.error(pdf ? t("الصيغ المقبولة: PDF أو PNG أو JPG", "Use PDF, PNG or JPG") : t("الصيغ المقبولة: PNG أو JPG أو WEBP", "Use PNG, JPG or WEBP")),
  });
  const rm = useMutation({ mutationFn: () => apiDelete<Letterhead>(`/letterheads/${lh.id}/image?slot=${slot}`), onSuccess: done });
  return (
    <div className="flex items-center gap-2 rounded-xl border border-dashed bg-paper p-3">
      <ImagePlus className="size-4 shrink-0 text-terra" />
      <span className="flex-1 text-sm">{label}</span>
      {current && <button onClick={() => rm.mutate()} className="rounded p-1 text-muted-foreground hover:text-destructive" title={t("إزالة", "Remove")} data-testid={`letterhead-${slot}-image-remove`}><X className="size-4" /></button>}
      <Button size="sm" variant="outline" onClick={() => ref.current?.click()} disabled={up.isPending} data-testid={`letterhead-${slot}-image-upload`}>
        {up.isPending ? t("جارٍ الرفع…", "Uploading…") : current ? t("استبدال", "Replace") : t("رفع صورة", "Upload")}
      </Button>
      <input ref={ref} type="file" hidden accept={pdf ? ".pdf,.png,.jpg,.jpeg,.webp" : ".png,.jpg,.jpeg,.webp"} data-testid={`letterhead-${slot}-image-input`}
        onChange={(e) => { const file = e.target.files?.[0]; if (file) up.mutate(file); e.target.value = ""; }} />
    </div>
  );
}

export default function Letterheads() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const list = useLetterheads();
  const logoId = useOffice().data?.logo_image_id;
  const [selId, setSelId] = useState("");
  const [f, setF] = useState<LetterheadIn>(BLANK);
  const items = list.data ?? [];
  const sel = items.find((x) => x.id === selId) ?? items[0];

  useEffect(() => {
    if (sel) {
      const { id: _id, created_at: _c, header_image_id: _h, footer_image_id: _f, page_image_id: _p, signature_image_id: _s, stamp_image_id: _st, ...rest } = sel;
      setF(rest);
    }
  }, [sel?.id]);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["letterheads"] });
  const create = useMutation({
    mutationFn: () => apiPost<Letterhead>("/letterheads", { ...BLANK, name: items.length ? `${BLANK.name} ${items.length + 1}` : BLANK.name }),
    onSuccess: (d) => { invalidate(); setSelId(d.id); toast.success(t("أضيفت ترويسة — عدّل معطياتها", "Letterhead added — edit its details")); },
  });
  const save = useMutation({
    mutationFn: () => apiPut<Letterhead>(`/letterheads/${sel?.id}`, f),
    onSuccess: () => { invalidate(); toast.success(t("تم حفظ الترويسة", "Letterhead saved")); },
    onError: () => toast.error(t("أدخل اسماً للترويسة", "Enter a name")),
  });
  const del = useMutation({
    mutationFn: (id: string) => apiDelete(`/letterheads/${id}`),
    onSuccess: () => { invalidate(); setSelId(""); },
  });

  const preview: Letterhead | undefined = sel ? { ...sel, ...f } : undefined;
  const set = (k: keyof LetterheadIn) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  return (
    <div>
      <PageHeader
        title={t("الترويسات", "Letterheads")}
        subtitle={t("ترويسة المكتب تظهر أعلى وأسفل كل صفحة عند الطباعة وتصدير PDF، وتُستعمل نموذجاً لكل وثيقة جديدة.", "Your letterhead frames every printed / PDF page and is the base of every new document.")}
        actions={<Button onClick={() => create.mutate()} disabled={create.isPending} data-testid="letterhead-new-button"><Plus className="size-4" />{t("ترويسة جديدة", "New letterhead")}</Button>}
      />
      {items.length === 0 && !list.isPending ? (
        <EmptyState title={t("لا ترويسة بعد", "No letterhead yet")} hint={t("أنشئ ترويسة بنص المكتب، أو ارفع صورة ترويستك الجاهزة.", "Build one from your office details, or upload your existing letterhead image.")} testId="letterheads-empty" />
      ) : sel && preview && (
        <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
          <div className="space-y-4">
            <ul className="flex flex-wrap gap-2" data-testid="letterhead-list">
              {items.map((x) => (
                <li key={x.id}>
                  <button onClick={() => setSelId(x.id)} data-testid="letterhead-list-item"
                    className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors duration-150", x.id === sel.id ? "border-terra bg-terra text-white" : "bg-card hover:border-terra")}>
                    {x.is_default && <Star className="size-3.5 fill-current" />}{x.name}
                  </button>
                </li>
              ))}
            </ul>
            <div className="space-y-4 rounded-2xl border bg-card p-5" data-testid="letterhead-form">
              <Field label={t("اسم الترويسة (داخلي)", "Name (internal)")}><Input value={f.name} onChange={set("name")} data-testid="letterhead-name-input" /></Field>
              <Field label={t("اسم المكتب / المحامي", "Office / lawyer name")}><Input value={f.office_name} onChange={set("office_name")} data-testid="letterhead-office-input" /></Field>
              <Field label={t("الصفة والهيئة", "Title & bar")}><Input value={f.subtitle} onChange={set("subtitle")} data-testid="letterhead-subtitle-input" /></Field>
              <Field label={t("العنوان", "Address")}><Input value={f.address} onChange={set("address")} data-testid="letterhead-address-input" /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label={t("الهاتف", "Phone")}><Input dir="ltr" value={f.phone} onChange={set("phone")} data-testid="letterhead-phone-input" /></Field>
                <Field label={t("البريد", "Email")}><Input dir="ltr" value={f.email} onChange={set("email")} data-testid="letterhead-email-input" /></Field>
              </div>
              <Field label={t("نص التذييل", "Footer text")}>
                <Textarea rows={2} value={f.footer_text} onChange={set("footer_text")} placeholder={t("مثال: رقم الحساب البنكي، أوقات الاستقبال…", "e.g. bank account, office hours…")} data-testid="letterhead-footer-input" />
              </Field>
              <Field label={t("المحاذاة", "Alignment")}>
                <Pick value={f.align} onChange={(v) => setF({ ...f, align: v as LetterheadIn["align"] })} testId="letterhead-align-select"
                  options={[{ value: "center", label: t("في الوسط", "Centered") }, { value: "start", label: t("في البداية", "Start") }]} />
              </Field>
              <ImageSlotControl lh={sel} slot="header" label={t("صورة الترويسة (أعلى الصفحة)", "Header image (top)")} />
              <ImageSlotControl lh={sel} slot="footer" label={t("صورة التذييل (أسفل الصفحة)", "Footer image (bottom)")} />
              <label className="flex items-center justify-between gap-3 text-sm">
                {t("إدراج شعار المكتب في الترويسة", "Include the office logo")}
                <Checkbox checked={f.show_office_logo} onCheckedChange={(v: boolean) => setF({ ...f, show_office_logo: v })} data-testid="letterhead-office-logo-checkbox" />
              </label>

              <div className="space-y-3 rounded-xl bg-ink p-4 text-stone-50" data-testid="letterhead-page-mode">
                <div className="flex items-center gap-2 font-bold"><FileUp className="size-4 text-gold" />{t("رأسية فارغة جاهزة (PDF)", "Ready blank letterhead (PDF)")}</div>
                <p className="text-xs leading-relaxed text-stone-400">{t("استورد ورقتك الرسمية الفارغة (PDF أو صورة) فتُستعمل خلفيةً لكل صفحة، ويُكتب النص داخل الهوامش التي تحددها. عند تفعيلها تُخفى الترويسة النصية.", "Import your blank letterhead (PDF or image); it becomes the background of every page and text flows within your margins.")}</p>
                <div className="text-ink"><ImageSlotControl lh={sel} slot="page" pdf label={t("ملف الرأسية الفارغة", "Blank letterhead file")} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label={t("الهامش العلوي (مم)", "Top margin (mm)")}>
                    <Input type="number" min={0} max={150} value={f.margin_top_mm} onChange={(e) => setF({ ...f, margin_top_mm: Number(e.target.value) })} className="bg-white text-ink" data-testid="letterhead-margin-top-input" />
                  </Field>
                  <Field label={t("الهامش السفلي (مم)", "Bottom margin (mm)")}>
                    <Input type="number" min={0} max={150} value={f.margin_bottom_mm} onChange={(e) => setF({ ...f, margin_bottom_mm: Number(e.target.value) })} className="bg-white text-ink" data-testid="letterhead-margin-bottom-input" />
                  </Field>
                </div>
              </div>

              <div className="space-y-3 rounded-xl border p-4" data-testid="letterhead-signature-section">
                <div className="flex items-center gap-2 font-bold"><PenLine className="size-4 text-terra" />{t("التوقيع والختم", "Signature & stamp")}</div>
                <Field label={t("اسم الموقّع", "Signer name")}><Input value={f.signer_name} onChange={set("signer_name")} placeholder={t("الأستاذ(ة) ............", "Maître ............")} data-testid="letterhead-signer-input" /></Field>
                <ImageSlotControl lh={sel} slot="signature" label={t("صورة التوقيع (PNG شفاف)", "Signature image (transparent PNG)")} />
                <ImageSlotControl lh={sel} slot="stamp" label={t("صورة ختم المكتب", "Office stamp image")} />
              </div>
              <label className="flex items-center justify-between gap-3 text-sm">
                {t("الترويسة الافتراضية للوثائق الجديدة", "Default for new documents")}
                <Checkbox checked={f.is_default} onCheckedChange={(v: boolean) => setF({ ...f, is_default: v })} data-testid="letterhead-default-switch" />
              </label>
              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => save.mutate()} disabled={save.isPending} data-testid="letterhead-save-button"><Save className="size-4" />{t("حفظ", "Save")}</Button>
                <Button variant="outline" className="text-destructive" onClick={() => { if (confirm(t("حذف هذه الترويسة؟", "Delete this letterhead?"))) del.mutate(sel.id); }} data-testid="letterhead-delete-button"><Trash2 className="size-4" /></Button>
              </div>
            </div>
          </div>
          <div>
            <div className="mb-2 text-sm text-muted-foreground">{t("معاينة الصفحة", "Page preview")}</div>
            <div className="sticky top-20 mx-auto flex aspect-[210/297] max-w-[640px] flex-col rounded-sm bg-white bg-contain bg-top bg-no-repeat px-10 py-9 shadow-[0_20px_50px_-20px_rgba(11,31,24,0.35)] ring-1 ring-stone-200" data-testid="letterhead-preview"
              style={preview.page_image_id ? { backgroundImage: `url(${fileUrl(preview.page_image_id)})`, paddingTop: `${(preview.margin_top_mm / 210) * 100}%`, paddingBottom: `${(preview.margin_bottom_mm / 210) * 100}%` } : undefined}>
              <LetterheadHeader lh={preview} logoId={logoId} />
              <div className="flex-1 space-y-3 py-8">
                {[92, 100, 78, 96, 64].map((w, i) => <div key={i} className="h-2 rounded-full bg-stone-200/70" style={{ width: `${w}%` }} />)}
                {hasSignature(preview) && <SignatureBlock lh={preview} />}
              </div>
              <LetterheadFooter lh={preview} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
