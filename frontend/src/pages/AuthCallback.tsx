import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApiError, apiPost } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { queryClient } from "@/lib/queryClient";
import { beginSession } from "@/lib/session";
import type { User } from "@/lib/types";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const processed = useRef(false);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;
    const sessionId = new URLSearchParams(window.location.hash.slice(1)).get("session_id") ?? "";
    apiPost<User>("/auth/session", { session_id: sessionId })
      .then((user) => {
        beginSession();
        queryClient.setQueryData(["me"], user);
        navigate("/", { replace: true });
      })
      .catch((e: unknown) => {
        if (e instanceof ApiError && e.status === 403) {
          window.history.replaceState(null, "", "/login");
          setDenied(true);
        } else navigate("/login", { replace: true });
      });
  }, [navigate]);

  if (denied)
    return (
      <div className="grid min-h-screen place-items-center bg-paper p-6">
        <div className="max-w-md rounded-2xl border bg-card p-8 text-center shadow-sm" data-testid="auth-denied">
          <h1 className="text-xl font-bold">{t("هذا الحساب غير مضاف إلى المكتب", "This account is not part of the office")}</h1>
          <p className="mt-3 text-muted-foreground">
            {t("اطلب من مدير المكتب إضافة بريدك في Google إلى قائمة الفريق ثم أعد المحاولة.", "Ask the office admin to add your Google email to the team, then try again.")}
          </p>
          <a href="/login" className="mt-6 inline-block text-terra underline" data-testid="auth-denied-back-link">
            {t("العودة إلى صفحة الدخول", "Back to sign in")}
          </a>
        </div>
      </div>
    );
  return <div className="min-h-screen bg-paper" />;
}
