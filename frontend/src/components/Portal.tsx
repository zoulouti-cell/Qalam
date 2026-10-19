import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, Eye, Link2, MessageCircle, Mic, RefreshCw, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { MicButton } from "@/components/Voice";
import { apiDelete, apiGet, apiPost } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { waLink } from "@/lib/whatsapp";
import type { CaseEvent, CaseEventIn, PortalLink } from "@/lib/types";

/** Client page: create / copy / WhatsApp / revoke the client's private portal link. */
export function PortalLinkControls({ clientId, phone }: { clientId: string; phone: string }) {
  const { t } = useI18n();
  const qc = useQueryClient();
  const link = useQuery({ queryKey: ["portal-link", clientId], queryFn: () => apiGet<PortalLink>(`/clients/${clientId}/portal`) });
  const set = (d: PortalLink) => qc.setQueryData(["portal-link", clientId], d);
  const create = useMutation({ mutationFn: () => apiPost<PortalLink>(`/clients/${clientId}/portal`), onSuccess: (d) => { set(d); toast.success(t("أُنشئ رابط الموكل", "Client link created")); } });
  const revoke = useMutation({ mutationFn: () => apiDelete(`/clients/${clientId}/portal`), onSuccess: () => set({ token: "" }) });
  const token = link.data?.token;
  const url = token ? `${window.location.origin}/portal/${token}` : "";
  if (!token) {
    return <Button variant="outline" onClick={() => create.mutate()} disabled={create.isPending || link.isPending} data-testid="portal-create-button"><Link2 className="size-4" />{t("رابط الموكل", "Client link")}</Button>;
  }
  return (
    <div className="flex flex-wrap items-center gap-1 rounded-xl border bg-card p-1" data-testid="portal-link-controls">
      <Button size="sm" variant="ghost" onClick={() => { void navigator.clipboard.writeText(url); toast.success(t("نُسخ رابط الموكل", "Client link copied")); }} data-testid="portal-copy-button"><Copy className="size-3.5" />{t("نسخ رابط الموكل", "Copy client link")}</Button>
      <a href={waLink(phone, t("مرحباً، يمكنكم تتبع ملفكم وجلساتكم وفواتيركم عبر هذا الرابط الخاص: {l}", "Hello, you can follow your case, hearings and invoices on this private link: {l}", { l: url }))} target="_blank" rel="noreferrer"
        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-emerald-700 hover:bg-emerald-50" data-testid="portal-whatsapp-link"><MessageCircle className="size-3.5" />WhatsApp</a>
      <Button size="icon" variant="ghost" className="size-7" title={t("رابط جديد (يُلغى القديم)", "New link (old one stops working)")} onClick={() => { if (confirm(t("إنشاء رابط جديد؟ سيتوقف الرابط القديم.", "Create a new link? The old one will stop working."))) create.mutate(); }} data-testid="portal-rotate-button"><RefreshCw className="size-3.5" /></Button>
      <Button size="icon" variant="ghost" className="size-7 text-destructive" title={t("إلغاء الرابط", "Revoke link")} onClick={() => revoke.mutate()} data-testid="portal-revoke-button"><X className="size-3.5" /></Button>
    </div>
  );
}

/** Agenda: dictate the hearing outcome and save it straight into the case log. */
export function HearingNoteButton({ caseId, date, label }: { caseId: string; date: string; label: string }) {
  const { t } = useI18n();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [shared, setShared] = useState(false);
  const save = useMutation({
    mutationFn: () => apiPost<CaseEvent>(`/cases/${caseId}/events`, { date, title: t("نتيجة جلسة {d}", "Hearing outcome {d}", { d: date }), details: text.trim(), shared } satisfies CaseEventIn),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["case-events", caseId] });
      qc.invalidateQueries({ queryKey: ["agenda"] });
      qc.invalidateQueries({ queryKey: ["agenda-week"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success(t("حُفظت النتيجة في سجل الملف", "Saved to the case log"));
      setText(""); setShared(false); setOpen(false);
    },
    onError: () => toast.error(t("تعذر الحفظ", "Could not save")),
  });
  if (!caseId) return null;
  return (
    <>
      <button onClick={() => setOpen(true)} className="no-print inline-flex items-center gap-1 rounded-lg border border-[#D4AF37]/50 px-2.5 py-1 text-xs font-medium text-[#7A5F14] transition-colors hover:bg-[#D4AF37]/10" data-testid="hearing-note-button">
        <Mic className="size-3.5" />{t("نتيجة الجلسة", "Hearing outcome")}
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md" data-testid="hearing-note-dialog">
          <DialogHeader><DialogTitle>{t("نتيجة الجلسة", "Hearing outcome")} — {label}</DialogTitle></DialogHeader>
          <p className="text-xs text-muted-foreground">{t("اضغط على الميكروفون وأملِ القرار (تأجيل، إدراج في المداولة، حكم…)، ثم راجع النص واحفظه.", "Tap the mic and dictate the outcome (adjourned, deliberation, judgment…), review, then save.")}</p>
          <div className="flex items-start gap-2">
            <Textarea rows={5} value={text} onChange={(e) => setText(e.target.value)} placeholder={t("مثال: أُجّلت القضية لجلسة 12 نونبر لإدلاء الخصم بمذكرة جوابية.", "e.g. Adjourned to 12 Nov for the opponent's reply.")} data-testid="hearing-note-textarea" />
            <MicButton onText={(txt) => setText((p) => (p ? `${p} ${txt}` : txt))} className="size-12 border-2 border-[#D4AF37]/60" testId="hearing-note-mic" />
          </div>
          <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-paper p-2.5 text-sm" data-testid="hearing-note-share-label">
            <Checkbox checked={shared} onCheckedChange={(v) => setShared(v === true)} data-testid="hearing-note-share-checkbox" />
            <Eye className="size-4 text-terra" />{t("إظهار نص النتيجة للموكل في فضائه", "Show this outcome text to the client in their portal")}
          </label>
          <Button onClick={() => save.mutate()} disabled={!text.trim() || save.isPending} data-testid="hearing-note-save">{t("حفظ في سجل الملف", "Save to case log")}</Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
