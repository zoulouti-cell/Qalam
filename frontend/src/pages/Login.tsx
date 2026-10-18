import { Navigate } from "react-router-dom";
import { BookOpen, CalendarDays, FolderOpen, Scale, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import LangToggle from "@/components/LangToggle";
import { useI18n } from "@/lib/i18n";
import { useMe } from "@/lib/hooks";

const HERO = "https://images.unsplash.com/photo-1758518731462-d091b0b4ed0d?crop=entropy&cs=srgb&fm=jpg&q=80&w=1600";

export default function Login() {
  const { t } = useI18n();
  const me = useMe();
  if (me.data) return <Navigate to="/" replace />;

  const signIn = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + "/";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const features = [
    { icon: FolderOpen, ar: "الموكلون والملفات وسجل الجلسات", en: "Clients, case files & hearing logs" },
    { icon: CalendarDays, ar: "تقويم الجلسات والمواعيد", en: "Hearings & appointments calendar" },
    { icon: BookOpen, ar: "مكتبة النصوص والاجتهادات", en: "Legal texts & case-law library" },
    { icon: Sparkles, ar: "مساعد قانوني ذكي بالعربية", en: "Arabic-speaking AI legal assistant" },
  ];

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.15fr_1fr]">
      <section className="relative hidden overflow-hidden lg:block">
        <img src={HERO} alt="" className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(28,25,23,0.93)_0%,rgba(41,37,36,0.84)_100%)]" />
        <div className="relative flex h-full flex-col justify-between p-12 text-stone-50">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-xl bg-[#FDBA74] text-ink"><Scale className="size-6" /></div>
            <span className="text-2xl font-bold">{t("مكتبي", "Maktabi")}</span>
          </div>
          <div className="max-w-lg animate-rise">
            <span className="inline-block rounded-full bg-[#78350F]/70 px-3 py-1 text-sm text-[#FDBA74]">
              {t("مصمم للممارسة المهنية بالمغرب", "Built for Moroccan legal practice")}
            </span>
            <h1 className="mt-5 text-5xl font-bold leading-tight">{t("مكتب المحاماة كله، في مكان واحد هادئ.", "Your whole law office, in one calm place.")}</h1>
            <ul className="mt-10 space-y-4">
              {features.map((f) => (
                <li key={f.en} className="flex items-center gap-3 text-stone-300">
                  <f.icon className="size-5 text-[#FDBA74]" /> {t(f.ar, f.en)}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-sm text-stone-400">© {new Date().getFullYear()} {t("مكتبي", "Maktabi")}</p>
        </div>
      </section>

      <section className="relative flex flex-col bg-paper p-8">
        <div className="flex justify-end"><LangToggle /></div>
        <div className="m-auto w-full max-w-sm animate-rise">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="grid size-10 place-items-center rounded-xl bg-ink text-[#FDBA74]"><Scale className="size-5" /></div>
            <span className="text-2xl font-bold">{t("مكتبي", "Maktabi")}</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight">{t("مرحباً بك", "Welcome")}</h2>
          <p className="mt-2 text-muted-foreground">{t("سجّل الدخول بحساب Google المضاف إلى فريق المكتب.", "Sign in with the Google account added to your office team.")}</p>
          <Button onClick={signIn} size="lg" className="mt-8 h-12 w-full gap-3 text-base transition-transform duration-200 hover:-translate-y-0.5" data-testid="login-google-button">
            <svg viewBox="0 0 24 24" className="size-5" aria-hidden><path fill="#fff" d="M21.35 11.1H12v2.98h5.35c-.23 1.4-1.66 4.1-5.35 4.1-3.22 0-5.85-2.67-5.85-5.96S8.78 6.26 12 6.26c1.83 0 3.06.78 3.76 1.45l2.56-2.47C16.68 3.7 14.55 2.7 12 2.7 6.87 2.7 2.7 6.87 2.7 12s4.17 9.3 9.3 9.3c5.37 0 8.93-3.77 8.93-9.09 0-.61-.07-1.08-.16-1.53z"/></svg>
            {t("الدخول بحساب Google", "Continue with Google")}
          </Button>
          <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
            {t("أول حساب يسجّل الدخول يصبح مدير المكتب. يضيف المدير بقية أعضاء الفريق من صفحة الفريق.", "The first account to sign in becomes the office admin, who then adds team members.")}
          </p>
        </div>
      </section>
    </div>
  );
}
