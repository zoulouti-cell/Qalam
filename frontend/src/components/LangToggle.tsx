import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

export default function LangToggle({ className }: { className?: string }) {
  const { lang, setLang } = useI18n();
  return (
    <Button
      variant="outline"
      size="sm"
      className={className}
      onClick={() => setLang(lang === "ar" ? "en" : "ar")}
      data-testid="lang-toggle-button"
    >
      <Languages className="size-4" />
      {lang === "ar" ? "English" : "العربية"}
    </Button>
  );
}
