import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/shared";
import { ApiError, apiPost } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { beginSession } from "@/lib/session";
import { clearSignup, getSignup } from "@/lib/signup";
import type { ForgotIn, PasswordLogin, PasswordRegister, ResetIn, User } from "@/lib/types";

type Mode = "login" | "register" | "forgot";

const errCode = (e: unknown) => (e instanceof ApiError ? ((e.body as { detail?: string } | null)?.detail ?? "") : "");

/** Email & password sign-in, below the Google button. Same rule: only team emails (or the first account). */
export function PasswordForm() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const nav = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const messages: Record<string, string> = {
    invalid_credentials: t("البريد أو كلمة المرور غير صحيحة", "Wrong email or password"),
    too_many_attempts: t("محاولات كثيرة — أعد المحاولة بعد 15 دقيقة", "Too many attempts — try again in 15 minutes"),
    invalid_invite_code: t("رمز الدعوة غير صحيح", "Invalid invite code"),
    office_suspended: t("حساب هذا المكتب موقوف — تواصل مع إدارة المنصة", "This office is suspended — contact the platform"),
    password_already_set: t("لهذا البريد كلمة مرور بالفعل — سجّل الدخول أو استعمل «نسيت كلمة المرور»", "A password is already set — sign in or reset it"),
  };
  const done = (u: User) => { clearSignup(); beginSession(); qc.setQueryData(["me"], u); nav("/", { replace: true }); };
  const submit = useMutation({
    mutationFn: async () => {
      if (mode === "login") return apiPost<User>("/auth/login", { email, password } satisfies PasswordLogin);
      if (mode === "register") return apiPost<User>("/auth/register", { email, password, name, ...getSignup() } satisfies PasswordRegister);
      await apiPost("/auth/forgot-password", { email } satisfies ForgotIn);
      return null;
    },
    onSuccess: (u) => {
      if (u) return done(u);
      toast.success(t("إن كان لهذا البريد حساب فستصلك رسالة برابط صالح لساعة واحدة", "If this email has an account, a 1-hour reset link is on its way"));
      setMode("login");
    },
    onError: (e) => toast.error(messages[errCode(e)] ?? (mode === "register" ? t("كلمة المرور 8 أحرف على الأقل", "Password must be at least 8 characters") : t("تعذر تسجيل الدخول", "Could not sign in"))),
  });

  return (
    <form className="mt-6 space-y-3" onSubmit={(e) => { e.preventDefault(); submit.mutate(); }} data-testid="password-form">
      <div className="flex items-center gap-3 text-xs text-muted-foreground"><div className="h-px flex-1 bg-border" />{t("أو بالبريد وكلمة المرور", "or with email & password")}<div className="h-px flex-1 bg-border" /></div>
      {mode === "register" && (
        <Field label={t("الاسم", "Name")}><Input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" data-testid="password-name-input" /></Field>
      )}
      <Field label={t("البريد الإلكتروني", "Email")}>
        <Input type="email" dir="ltr" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" data-testid="password-email-input" />
      </Field>
      {mode !== "forgot" && (
        <Field label={mode === "register" ? t("كلمة مرور جديدة (8 أحرف على الأقل)", "New password (min. 8 characters)") : t("كلمة المرور", "Password")}>
          <Input type="password" dir="ltr" required minLength={mode === "register" ? 8 : 1} value={password} onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "register" ? "new-password" : "current-password"} data-testid="password-password-input" />
        </Field>
      )}
      <Button type="submit" variant="outline" className="h-11 w-full" disabled={submit.isPending} data-testid="password-submit-button">
        {mode === "login" ? t("تسجيل الدخول", "Sign in") : mode === "register" ? t("إنشاء كلمة المرور والدخول", "Create password & sign in") : t("إرسال رابط إعادة التعيين", "Send reset link")}
      </Button>
      <div className="flex flex-wrap justify-between gap-2 text-xs">
        {mode !== "login" ? (
          <button type="button" className="text-terra hover:underline" onClick={() => setMode("login")} data-testid="password-mode-login">{t("لدي كلمة مرور — تسجيل الدخول", "I have a password — sign in")}</button>
        ) : (
          <button type="button" className="text-terra hover:underline" onClick={() => setMode("register")} data-testid="password-mode-register">{t("أول مرة؟ أنشئ حساباً", "First time? Create an account")}</button>
        )}
        {mode === "login" && <button type="button" className="text-muted-foreground hover:underline" onClick={() => setMode("forgot")} data-testid="password-mode-forgot">{t("نسيت كلمة المرور؟", "Forgot password?")}</button>}
      </div>
    </form>
  );
}

export default function ResetPassword() {
  const { t } = useI18n();
  const [sp] = useSearchParams();
  const nav = useNavigate();
  const [password, setPassword] = useState("");
  const reset = useMutation({
    mutationFn: () => apiPost("/auth/reset-password", { token: sp.get("token") ?? "", password } satisfies ResetIn),
    onSuccess: () => { toast.success(t("تم تغيير كلمة المرور — سجّل الدخول", "Password changed — please sign in")); nav("/login", { replace: true }); },
    onError: () => toast.error(t("الرابط غير صالح أو منتهي الصلاحية", "This link is invalid or expired")),
  });
  return (
    <div className="grid min-h-screen place-items-center bg-paper p-6">
      <form className="w-full max-w-sm space-y-4 rounded-2xl border bg-card p-6 shadow-sm" onSubmit={(e) => { e.preventDefault(); reset.mutate(); }} data-testid="reset-password-form">
        <img src="/brand/qalam-badge.png" alt="" className="size-14 rounded-full" />
        <h1 className="text-2xl font-bold">{t("كلمة مرور جديدة", "New password")}</h1>
        <Field label={t("كلمة المرور (8 أحرف على الأقل)", "Password (min. 8 characters)")}>
          <Input type="password" dir="ltr" minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" data-testid="reset-password-input" />
        </Field>
        <Button type="submit" className="w-full" disabled={reset.isPending} data-testid="reset-password-submit">{t("حفظ", "Save")}</Button>
        <Link to="/login" className="block text-center text-xs text-muted-foreground hover:underline" data-testid="reset-back-to-login">{t("العودة إلى الدخول", "Back to sign in")}</Link>
      </form>
    </div>
  );
}
