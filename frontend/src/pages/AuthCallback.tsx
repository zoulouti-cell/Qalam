import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApiError, apiPost } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { queryClient } from "@/lib/queryClient";
import { beginSession } from "@/lib/session";
import { clearSignup, getSignup } from "@/lib/signup";
import type { SessionIn, User } from "@/lib/types";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const processed = useRef(false);
  const [denied, setDenied] = useState("");

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;
    const sessionId = new URLSearchParams(window.location.hash.slice(1)).get("session_id") ?? "";
    apiPost<User>("/auth/session", { session_id: sessionId, ...getSignup() } satisfies SessionIn)
      .then((user) => {
        clearSignup();
        beginSession();
        queryClient.setQueryData(["me"], user);
        navigate("/", { replace: true });
      })
      .catch((e: unknown) => {
        if (e instanceof ApiError && (e.status === 403 || e.status === 404)) {
          window.history.replaceState(null, "", "/login");
          setDenied(e.status === 404 ? "code" : "suspended");
        } else navigate("/login", { replace: true });
      });
  }, [navigate]);

  if (denied)
    return (
      <div className="grid min-h-screen place-items-center bg-paper p-6">
        <div className="max-w-md rounded-2xl border bg-card p-8 text-center shadow-sm" data-testid="auth-denied">
          <h1 className="text-xl font-bold">{denied === "code" ? t("رمز الدعوة غير صحيح", "Invalid invite code") : t("حساب هذا المكتب موقوف", "This office is suspended")}</h1>
          <p className="mt-3 text-muted-foreground">
            {denied === "code"
              ? t("تحقق من الرمز لدى مدير مكتبك، أو اختر «مكتب جديد» ثم أعد المحاولة.", "Check the code with your office admin, or choose \"New office\", then try again.")
              : t("تواصل مع إدارة منصة قلم لإعادة تفعيل المكتب.", "Contact the Qalam platform to reactivate the office.")}
          </p>
          <a href="/login" className="mt-6 inline-block text-terra underline" data-testid="auth-denied-back-link">
            {t("العودة إلى صفحة الدخول", "Back to sign in")}
          </a>
        </div>
      </div>
    );
  return <div className="min-h-screen bg-paper" />;
}
