import { Button } from "@/components/ui/button";
import { useI18n, type Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const LANGS: [Lang, string][] = [["ar", "ع"], ["fr", "FR"], ["en", "EN"]];

export default function LangToggle({ className }: { className?: string }) {
  const { lang, setLang } = useI18n();
  return (
    <div className={cn("inline-flex rounded-lg border bg-card p-0.5", className)} role="group" data-testid="lang-toggle">
      {LANGS.map(([code, label]) => (
        <Button
          key={code}
          variant="ghost"
          size="sm"
          onClick={() => setLang(code)}
          className={cn("h-7 min-w-9 px-2 text-xs transition-colors duration-150", lang === code && "bg-ink text-[#E6C766] hover:bg-ink hover:text-[#E6C766]")}
          data-testid={`lang-option-${code}`}
          aria-pressed={lang === code}
        >
          {label}
        </Button>
      ))}
    </div>
  );
}
