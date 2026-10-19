import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Cloud, CloudOff, Database, Download, HardDrive, ImagePlus, MonitorDown, RefreshCw, Save, Smartphone, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, PageHeader } from "@/components/shared";
import { apiDelete, apiGet, apiPost, apiPut, apiUpload, fileUrl } from "@/lib/api";
import { useOffice } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import { isStandalone, useInstallPrompt } from "@/lib/pwa";
import { persister } from "@/lib/queryClient";
import { notify, remindersEnabled, setRemindersPref } from "@/lib/reminders";
import type { Case, Client, DriveStatus, Office, ReminderStatus, RestoreResult } from "@/lib/types";

function Section({ icon: Icon, title, hint, children, testId }: { icon: typeof Cloud; title: string; hint: string; children: React.ReactNode; testId: string }) {
  return (
    <section className="animate-rise rounded-2xl border bg-card p-6" data-testid={testId}>
      <div className="mb-4 flex items-start gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-ink text-gold"><Icon className="size-5" /></div>
        <div>
          <h2 className="text-lg font-bold">{title}</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">{hint}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function OfficeSection() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const office = useOffice().data;
  const [name, setName] = useState("");
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { if (office) setName(office.name); }, [office?.name]); // eslint-disable-line react-hooks/exhaustive-deps
  const done = (o: Office) => qc.setQueryData(["office"], o);
  const save = useMutation({ mutationFn: () => apiPut<Office>("/office", { whatsapp_number: "", email_reminders: true, ...office, name }), onSuccess: (o) => { done(o); toast.success(t("تم الحفظ", "Saved")); } });
  const up = useMutation({
    mutationFn: (f: File) => apiUpload<Office>("/office/logo", f),
    onSuccess: (o) => { done(o); toast.success(t("تم رفع الشعار", "Logo uploaded")); },
    onError: () => toast.error(t("الصيغ المقبولة: PNG أو JPG أو WEBP", "Use PNG, JPG or WEBP")),
  });
  const rm = useMutation({ mutationFn: () => apiDelete<Office>("/office/logo"), onSuccess: done });
  return (
    <Section icon={ImagePlus} title={t("هوية المكتب", "Office identity")} testId="settings-office-section"
      hint={t("شعار مكتبك مستقل عن شعار «قلم»: يظهر في أعلى الواجهة (يساراً بالعربية ويميناً بالفرنسية)، ويمكن إدراجه في الترويسات.", "Your office logo is separate from Qalam's: it shows at the header's end and can be added to letterheads.")}>
      <div className="grid gap-5 sm:grid-cols-[1fr_220px]">
        <div className="space-y-3">
          <Field label={t("اسم المكتب", "Office name")}><Input value={name} onChange={(e) => setName(e.target.value)} data-testid="office-name-input" /></Field>
          <Button onClick={() => save.mutate()} disabled={save.isPending} data-testid="office-save-button"><Save className="size-4" />{t("حفظ", "Save")}</Button>
        </div>
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-paper p-4">
          {office?.logo_image_id
            ? <img src={fileUrl(office.logo_image_id)} alt="" className="h-20 w-auto object-contain" data-testid="office-logo-preview" />
            : <div className="text-xs text-muted-foreground">{t("لا شعار بعد", "No logo yet")}</div>}
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => ref.current?.click()} disabled={up.isPending} data-testid="office-logo-upload-button">
              <Upload className="size-4" />{office?.logo_image_id ? t("استبدال", "Replace") : t("رفع الشعار", "Upload logo")}
            </Button>
            {office?.logo_image_id && <Button size="sm" variant="ghost" onClick={() => rm.mutate()} data-testid="office-logo-remove-button"><X className="size-4" /></Button>}
          </div>
          <input ref={ref} type="file" hidden accept=".png,.jpg,.jpeg,.webp" data-testid="office-logo-input"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) up.mutate(f); e.target.value = ""; }} />
        </div>
      </div>
    </Section>
  );
}

function DriveSection() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const [sp, setSp] = useSearchParams();
  const st = useQuery({ queryKey: ["drive-status"], queryFn: () => apiGet<DriveStatus>("/drive/status"), refetchInterval: (q) => (q.state.data?.pending ? 5000 : false) });
  useEffect(() => {
    const r = sp.get("drive");
    if (!r) return;
    if (r === "connected") toast.success(t("تم ربط Google Drive — بدأت المزامنة", "Google Drive connected — sync started"));
    else toast.error(t("تعذر ربط Google Drive", "Could not connect Google Drive"));
    setSp({}, { replace: true });
  }, [sp, setSp, t]);
  const connect = useMutation({ mutationFn: () => apiGet<{ authorization_url: string }>("/drive/connect"), onSuccess: (r) => window.location.assign(r.authorization_url) });
  const sync = useMutation({ mutationFn: () => apiPost("/drive/sync"), onSuccess: () => { toast.success(t("بدأت المزامنة", "Sync started")); qc.invalidateQueries({ queryKey: ["drive-status"] }); } });
  const disconnect = useMutation({ mutationFn: () => apiDelete("/drive"), onSuccess: () => qc.invalidateQueries({ queryKey: ["drive-status"] }) });
  const d = st.data;
  return (
    <Section icon={Cloud} title="Google Drive" testId="settings-drive-section"
      hint={t("مزامنة تلقائية في الاتجاهين مع مجلد «Qalam - قلم» على Drive مكتبك (مجلد فرعي لكل ملف): ما تضيفه أو تحذفه في التطبيق يظهر في Drive فوراً، وما تضعه أو تستبدله أو تحذفه في مجلد الملف على Drive يظهر في التطبيق خلال 10 دقائق. وتُحدَّث جداول Google Sheets (الموكلون، الملفات، الجلسات، الفواتير) تلقائياً للقراءة فقط.", "Automatic two-way sync with a “Qalam” folder on your office Drive (one subfolder per case): what you add or delete in the app shows in Drive instantly; files you add, replace or delete in a case folder on Drive show in the app within 10 minutes. Read-only Google Sheets (clients, cases, hearings, invoices) refresh automatically.")}>
      {!d ? null : !d.configured ? (
        <div className="flex items-start gap-3 rounded-xl bg-warm/60 p-4 text-sm" data-testid="drive-not-configured">
          <CloudOff className="mt-0.5 size-4 shrink-0 text-terra" />
          <div>{t("الربط جاهز ولكنه غير مفعّل بعد: يلزم إضافة معرّف OAuth الخاص بالمكتب (Client ID و Client Secret) من Google Cloud. عند توفيرهما سيظهر هنا زر «ربط Google Drive».", "Ready but not activated: the office's Google Cloud OAuth Client ID & Secret must be added. A “Connect” button will then appear here.")}</div>
        </div>
      ) : !d.connected ? (
        <Button onClick={() => connect.mutate()} disabled={connect.isPending} data-testid="drive-connect-button"><Cloud className="size-4" />{t("ربط Google Drive", "Connect Google Drive")}</Button>
      ) : (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-paper p-3"><div className="text-xs text-muted-foreground">{t("الحساب", "Account")}</div><div className="truncate font-medium" dir="ltr" data-testid="drive-email">{d.email || "—"}</div></div>
            <div className="rounded-xl bg-paper p-3"><div className="text-xs text-muted-foreground">{t("تمت مزامنته", "Synced")}</div><div className="text-xl font-bold text-terra" data-testid="drive-synced-count">{d.synced}</div></div>
            <div className="rounded-xl bg-paper p-3"><div className="text-xs text-muted-foreground">{t("في الانتظار", "Pending")}</div><div className="text-xl font-bold" data-testid="drive-pending-count">{d.pending}</div></div>
          </div>
          {d.last_error && <p className="text-xs text-destructive" data-testid="drive-last-error">{d.last_error}</p>}
          <div className="flex flex-wrap gap-2">
            {d.folder_url && <Button variant="outline" onClick={() => window.open(d.folder_url, "_blank")} data-testid="drive-open-folder-button">{t("فتح المجلد", "Open folder")}</Button>}
            <Button variant="outline" onClick={() => sync.mutate()} disabled={sync.isPending} data-testid="drive-sync-button"><RefreshCw className="size-4" />{t("مزامنة الآن", "Sync now")}</Button>
            <Button variant="ghost" className="text-destructive" onClick={() => { if (confirm(t("فصل Google Drive؟ تتوقف المزامنة وتبقى الملفات في Drive.", "Disconnect Drive? Sync stops; files stay in Drive."))) disconnect.mutate(); }} data-testid="drive-disconnect-button">{t("فصل", "Disconnect")}</Button>
          </div>
        </div>
      )}
    </Section>
  );
}

function BackupSection() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const ref = useRef<HTMLInputElement>(null);
  const restore = useMutation({
    mutationFn: (f: File) => apiUpload<RestoreResult>("/backup/restore", f),
    onSuccess: (r) => {
      qc.invalidateQueries();
      toast.success(t("تم الاسترجاع: {n} سجل و{f} ملف", "Restored {n} records and {f} files", { n: Object.values(r.collections).reduce((a, b) => a + b, 0), f: r.files }));
    },
    onError: () => toast.error(t("الملف ليس نسخة احتياطية صالحة من «قلم»", "Not a valid Qalam backup file")),
  });
  return (
    <Section icon={HardDrive} title={t("نسخة احتياطية على الحاسوب", "Backup to this computer")} testId="settings-backup-section"
      hint={t("ملف واحد (ZIP) يضم كل المعطيات والمرفقات والوثائق. احفظه على حاسوبك أو قرص خارجي، ويمكن استرجاعه عند الحاجة.", "One ZIP file with all data, attachments and documents. Keep it on your computer or an external drive and restore it when needed.")}>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => window.location.assign("/api/backup")} data-testid="backup-download-button"><Download className="size-4" />{t("تنزيل نسخة احتياطية", "Download backup")}</Button>
        <Button variant="outline" onClick={() => ref.current?.click()} disabled={restore.isPending} data-testid="backup-restore-button">
          <Upload className="size-4" />{restore.isPending ? t("جارٍ الاسترجاع…", "Restoring…") : t("استرجاع من نسخة", "Restore from backup")}
        </Button>
        <input ref={ref} type="file" hidden accept=".zip" data-testid="backup-restore-input"
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (f && confirm(t("سيعوّض الاسترجاع كل المعطيات الحالية بمحتوى النسخة. متابعة؟", "Restoring replaces all current data with the backup. Continue?"))) restore.mutate(f);
          }} />
      </div>
    </Section>
  );
}

function OfflineSection() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const prefetchAll = async () => {
    setBusy(true);
    try {
      const fetch = <T,>(key: unknown[], path: string) => qc.fetchQuery({ queryKey: key, queryFn: () => apiGet<T>(path) });
      const [clients, cases] = await Promise.all([fetch<Client[]>(["clients", ""], "/clients"), fetch<Case[]>(["cases", "", ""], "/cases")]);
      await Promise.all([
        fetch(["dashboard"], "/dashboard"), fetch(["documents", ""], "/documents"), fetch(["library", "", "", ""], "/library"),
        fetch(["templates"], "/templates"), fetch(["letterheads"], "/letterheads"), fetch(["conversations"], "/conversations"),
        ...clients.flatMap((c) => [fetch(["client", c.id], `/clients/${c.id}`), fetch(["client-cases", c.id], `/clients/${c.id}/cases`)]),
        ...cases.flatMap((c) => [
          fetch(["case", c.id], `/cases/${c.id}`), fetch(["case-events", c.id], `/cases/${c.id}/events`),
          fetch(["case-attachments", c.id], `/cases/${c.id}/attachments`), fetch(["documents", c.id], `/documents?case_id=${c.id}`),
        ]),
      ]);
      toast.success(t("حُفظت نسخة كاملة على هذا الجهاز", "A full copy is saved on this device"));
    } catch {
      toast.error(t("تعذر إكمال النسخة المحلية", "Could not complete the local copy"));
    } finally {
      setBusy(false);
    }
  };
  return (
    <Section icon={Database} title={t("نسخة محلية دون اتصال", "Offline copy on this device")} testId="settings-offline-section"
      hint={t("كل ما تفتحه يُحفظ تلقائياً في ذاكرة هذا الجهاز (المتصفح أو التطبيق المثبت)، فيبقى قابلاً للاطلاع عند انقطاع الإنترنت. تُحذف النسخة عند تسجيل الخروج.", "Everything you open is kept in this device's storage and stays readable without internet. It is erased on sign-out.")}>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => void prefetchAll()} disabled={busy} data-testid="offline-prefetch-button"><Database className="size-4" />{busy ? t("جارٍ الحفظ…", "Saving…") : t("حفظ كل المعطيات على هذا الجهاز", "Save everything on this device")}</Button>
        <Button variant="ghost" className="text-destructive" onClick={() => { void persister.removeClient(); toast.success(t("حُذفت النسخة المحلية", "Local copy erased")); }} data-testid="offline-clear-button">
          <Trash2 className="size-4" />{t("حذف النسخة المحلية", "Erase local copy")}
        </Button>
      </div>
    </Section>
  );
}

function RemindersSection() {
  const { t } = useI18n();
  const supported = typeof window !== "undefined" && "Notification" in window;
  const [on, setOn] = useState(remindersEnabled());
  const enable = async () => {
    const perm = await Notification.requestPermission();
    if (perm !== "granted") return toast.error(t("رُفض الإذن بالتنبيهات في المتصفح", "Notification permission was denied"));
    setRemindersPref(true);
    setOn(true);
    void notify(t("تم تفعيل تنبيهات «قلم»", "Qalam reminders are on"), t("ستصلك تنبيهات الجلسات والآجال على هذا الجهاز.", "You'll get hearing and deadline reminders on this device."));
  };
  return (
    <Section icon={Bell} title={t("تنبيهات الجلسات والآجال", "Hearing & deadline reminders")} testId="settings-reminders-section"
      hint={t("تنبيه على الهاتف أو الحاسوب قبل كل جلسة أو موعد بيوم وبساعة، وقبل آخر أجل للطعن بثلاثة أيام ويومه. يعمل عندما يكون التطبيق مفتوحاً أو مثبتاً على الجهاز.", "A reminder 1 day and 1 hour before each hearing, and 3 days before / on each deadline, while the app is open or installed.")}>
      {!supported ? (
        <p className="text-sm text-muted-foreground">{t("هذا المتصفح لا يدعم التنبيهات.", "This browser doesn't support notifications.")}</p>
      ) : on ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-terra" data-testid="reminders-status-on">{t("التنبيهات مفعّلة على هذا الجهاز ✓", "Reminders are on for this device ✓")}</span>
          <Button variant="outline" size="sm" onClick={() => void notify(t("تنبيه تجريبي", "Test reminder"), t("هكذا تظهر تنبيهات «قلم».", "This is how Qalam reminders look."))} data-testid="reminders-test-button">{t("تنبيه تجريبي", "Test")}</Button>
          <Button variant="ghost" size="sm" onClick={() => { setRemindersPref(false); setOn(false); }} data-testid="reminders-disable-button">{t("إيقاف", "Turn off")}</Button>
        </div>
      ) : (
        <Button onClick={() => void enable()} data-testid="reminders-enable-button"><Bell className="size-4" />{t("تفعيل التنبيهات", "Turn on reminders")}</Button>
      )}
      <ServerDigest />
    </Section>
  );
}

function ServerDigest() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const office = useOffice().data;
  const st = useQuery({ queryKey: ["reminder-status"], queryFn: () => apiGet<ReminderStatus>("/reminders/status") });
  const [wa, setWa] = useState("");
  useEffect(() => { if (office) setWa(office.whatsapp_number); }, [office?.whatsapp_number]); // eslint-disable-line react-hooks/exhaustive-deps
  const save = useMutation({
    mutationFn: (patch: Partial<Office>) => apiPut<Office>("/office", { name: "", whatsapp_number: "", email_reminders: true, ...office, ...patch }),
    onSuccess: (o) => { qc.setQueryData(["office"], o); toast.success(t("تم الحفظ", "Saved")); },
  });
  const test = useMutation({
    mutationFn: () => apiPost<ReminderStatus>("/reminders/test"),
    onSuccess: (r) => { qc.setQueryData(["reminder-status"], r); toast.success(r.last_emails ? t("أُرسل الملخص إلى بريدك", "Digest sent to your email") : t("لا جلسات ولا آجال قريبة لإرسالها اليوم", "Nothing due today or tomorrow")); },
    onError: () => toast.error(t("تعذر الإرسال", "Could not send")),
  });
  const s = st.data;
  return (
    <div className="mt-5 space-y-3 border-t pt-4" data-testid="server-digest-block">
      <div className="text-sm font-bold">{t("الملخص الآلي كل صباح (7:00)", "Automatic morning digest (7:00)")}</div>
      <p className="text-xs leading-relaxed text-muted-foreground">{t("يُرسل بالبريد إلى المحامي المكلف بكل ملف وإلى مدير المكتب: جلسات اليوم والغد والآجال التي تنقضي خلال 3 أيام، حتى لو كان التطبيق مغلقاً.", "Emailed to each case's lawyer and the admin: today's/tomorrow's hearings and deadlines within 3 days — even when the app is closed.")}</p>
      <label className="flex items-center justify-between gap-3 text-sm">
        {t("تنبيهات البريد الإلكتروني", "Email reminders")}
        <Checkbox checked={office?.email_reminders ?? true} onCheckedChange={(v: boolean) => save.mutate({ email_reminders: v })} data-testid="digest-email-checkbox" />
      </label>
      <Field label={t("رقم واتساب لاستقبال التنبيهات الآلية", "WhatsApp number for automatic reminders")}>
        <div className="flex gap-2">
          <Input dir="ltr" value={wa} onChange={(e) => setWa(e.target.value)} placeholder="+212 6XX XX XX XX" data-testid="digest-whatsapp-input" />
          <Button variant="outline" onClick={() => save.mutate({ whatsapp_number: wa })} data-testid="digest-whatsapp-save"><Save className="size-4" /></Button>
        </div>
      </Field>
      {s && !s.whatsapp_configured && (
        <p className="rounded-lg bg-warm/60 p-2 text-xs" data-testid="digest-whatsapp-inactive">{t("الإرسال الآلي عبر واتساب جاهز وغير مفعّل بعد: يحتاج إلى حساب Twilio (Account SID و Auth Token ورقم واتساب معتمد). إلى ذلك الحين استعمل أزرار «واتساب» بجانب الجلسات والآجال.", "Automatic WhatsApp is ready but inactive until Twilio credentials are added. Meanwhile use the WhatsApp buttons next to hearings and deadlines.")}</p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => test.mutate()} disabled={test.isPending || !s?.email_configured} data-testid="digest-test-button">{t("أرسل لي ملخص اليوم الآن", "Send me today's digest now")}</Button>
        {s?.last_run_at && <span className="text-xs text-muted-foreground" data-testid="digest-last-run">{t("آخر إرسال", "Last run")}: {s.last_run_at.slice(0, 16).replace("T", " ")} · {s.last_emails} ✉</span>}
      </div>
      {s?.last_error && <p className="text-xs text-destructive">{s.last_error}</p>}
    </div>
  );
}

function InstallSection() {
  const { t } = useI18n();
  const install = useInstallPrompt();
  return (
    <Section icon={MonitorDown} title={t("تطبيق Android و Windows", "Android & Windows app")} testId="settings-install-section"
      hint={t("ثبّت «قلم» كتطبيق مستقل بأيقونته الخاصة: يفتح في نافذته، ويعمل دون اتصال، ويوفر اختصارات سريعة (جدول الجلسات، وثيقة جديدة، المساعد) ومشاركة ملفات PDF مباشرة عبر واتساب أو البريد.", "Install Qalam as a standalone app with its own icon, offline support, quick shortcuts and direct PDF sharing.")}>
      {isStandalone() ? (
        <p className="text-sm font-medium text-terra" data-testid="install-status-installed">{t("التطبيق مثبت على هذا الجهاز ✓", "Installed on this device ✓")}</p>
      ) : (
        <div className="space-y-3">
          {install && <Button onClick={install} data-testid="settings-install-button"><MonitorDown className="size-4" />{t("تثبيت الآن", "Install now")}</Button>}
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-xl bg-paper p-3"><div className="mb-1 flex items-center gap-2 font-medium"><Smartphone className="size-4 text-terra" />Android</div>{t("افتح الرابط في Chrome ← القائمة ⋮ ← «تثبيت التطبيق».", "Open in Chrome → ⋮ menu → “Install app”.")}</div>
            <div className="rounded-xl bg-paper p-3"><div className="mb-1 flex items-center gap-2 font-medium"><MonitorDown className="size-4 text-terra" />Windows</div>{t("افتح الرابط في Edge أو Chrome ← أيقونة التثبيت في شريط العنوان، فيظهر «قلم» في قائمة ابدأ.", "Open in Edge or Chrome → install icon in the address bar; Qalam appears in the Start menu.")}</div>
          </div>
        </div>
      )}
    </Section>
  );
}

export default function SettingsPage() {
  const { t } = useI18n();
  return (
    <div>
      <PageHeader title={t("الإعدادات والنسخ الاحتياطي", "Settings & backup")} subtitle={t("هوية المكتب، المزامنة، حماية المعطيات، والتطبيق.", "Office identity, sync, data safety and app install.")} />
      <div className="grid gap-5 xl:grid-cols-2">
        <OfficeSection />
        <InstallSection />
        <RemindersSection />
        <BackupSection />
        <OfflineSection />
        <div className="xl:col-span-2"><DriveSection /></div>
      </div>
    </div>
  );
}
