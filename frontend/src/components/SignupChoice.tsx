import { useState } from "react";
import { Building2, KeyRound } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";
import { getSignup, setSignup } from "@/lib/signup";
import { cn } from "@/lib/utils";

/** Login page: for a first sign-in, create a new independent office or join one with an invite code. */
export default function SignupChoiceBox() {
  const { t } = useI18n();
  const init = getSignup();
  const [mode, setMode] = useState<"new" | "join">(init.invite_code ? "join" : "new");
  const [v, setV] = useState(init);
  const update = (next: typeof v) => { setV(next); setSignup(next); };
  const pick = (m: "new" | "join") => { setMode(m); update(m === "new" ? { ...v, invite_code: "" } : { ...v, office_name: "" }); };
  return (
    <div className="mt-6 rounded-2xl border border-[#D4AF37]/40 bg-card p-4" data-testid="signup-choice">
      <p className="mb-3 text-sm font-medium">{t("أول مرة على قلم؟", "First time on Qalam?")}</p>
      <div className="mb-3 grid grid-cols-2 gap-1 rounded-xl bg-paper p-1">
        {([["new", Building2, t("مكتب جديد", "New office")], ["join", KeyRound, t("الانضمام لمكتب", "Join an office")]] as const).map(([m, Icon, label]) => (
          <button key={m} type="button" onClick={() => pick(m)} data-testid={`signup-mode-${m}`}
            className={cn("flex items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors", mode === m ? "bg-ink text-[#E6C766] shadow-sm" : "text-muted-foreground hover:text-foreground")}>
            <Icon className="size-3.5" />{label}
          </button>
        ))}
      </div>
      {mode === "new" ? (
        <>
          <Input value={v.office_name} onChange={(e) => update({ ...v, office_name: e.target.value })} placeholder={t("اسم المكتب (اختياري)", "Office name (optional)")} data-testid="signup-office-name-input" />
          <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{t("يُنشأ لك مكتب مستقل تماماً وتصبح مديره، ثم تضيف فريقك.", "A fully independent office is created for you as its admin; then add your team.")}</p>
        </>
      ) : (
        <>
          <Input dir="ltr" value={v.invite_code} onChange={(e) => update({ ...v, invite_code: e.target.value.toUpperCase().trim() })} placeholder={t("رمز الدعوة", "Invite code")} className="font-mono tracking-widest" data-testid="signup-invite-code-input" />
          <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{t("اطلب الرمز من مدير مكتبك (صفحة الفريق).", "Ask your office admin for the code (Team page).")}</p>
        </>
      )}
      <p className="mt-2 text-[11px] text-muted-foreground">{t("إن كان لديك حساب، سجّل الدخول مباشرة.", "Already have an account? Just sign in.")}</p>
    </div>
  );
}
