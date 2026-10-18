import { useEffect, useRef } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlignCenter, AlignJustify, AlignLeft, AlignRight, Bold, Heading1, Heading2, Italic, List, ListOrdered, Pilcrow, Redo2, Underline, Undo2,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface Tool { id: string; icon: LucideIcon; ar: string; en: string; run: () => void }

const exec = (cmd: string, value?: string) => document.execCommand(cmd, false, value);

/** contentEditable rich-text editor. `html` is the source of truth; external changes (load, AI draft) are pushed in. */
export default function RichEditor({
  html, onChange, readOnly, placeholder, className,
}: { html: string; onChange: (html: string) => void; readOnly?: boolean; placeholder?: string; className?: string }) {
  const { t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== html) ref.current.innerHTML = html;
  }, [html]);

  const emit = () => onChange(ref.current?.innerHTML ?? "");
  const run = (fn: () => void) => { ref.current?.focus(); fn(); emit(); };

  const groups: Tool[][] = [
    [
      { id: "bold", icon: Bold, ar: "غامق", en: "Bold", run: () => exec("bold") },
      { id: "italic", icon: Italic, ar: "مائل", en: "Italic", run: () => exec("italic") },
      { id: "underline", icon: Underline, ar: "تسطير", en: "Underline", run: () => exec("underline") },
    ],
    [
      { id: "h1", icon: Heading1, ar: "عنوان رئيسي", en: "Heading", run: () => exec("formatBlock", "<h1>") },
      { id: "h2", icon: Heading2, ar: "عنوان فرعي", en: "Subheading", run: () => exec("formatBlock", "<h2>") },
      { id: "paragraph", icon: Pilcrow, ar: "فقرة", en: "Paragraph", run: () => exec("formatBlock", "<p>") },
    ],
    [
      { id: "align-right", icon: AlignRight, ar: "محاذاة يمين", en: "Align right", run: () => exec("justifyRight") },
      { id: "align-center", icon: AlignCenter, ar: "توسيط", en: "Center", run: () => exec("justifyCenter") },
      { id: "align-left", icon: AlignLeft, ar: "محاذاة يسار", en: "Align left", run: () => exec("justifyLeft") },
      { id: "align-justify", icon: AlignJustify, ar: "ضبط", en: "Justify", run: () => exec("justifyFull") },
    ],
    [
      { id: "bullets", icon: List, ar: "قائمة نقطية", en: "Bullets", run: () => exec("insertUnorderedList") },
      { id: "numbers", icon: ListOrdered, ar: "قائمة مرقمة", en: "Numbered", run: () => exec("insertOrderedList") },
    ],
    [
      { id: "undo", icon: Undo2, ar: "تراجع", en: "Undo", run: () => exec("undo") },
      { id: "redo", icon: Redo2, ar: "إعادة", en: "Redo", run: () => exec("redo") },
    ],
  ];

  return (
    <div className={className}>
      <div className="no-print sticky top-[61px] z-10 flex flex-wrap items-center gap-1 rounded-xl border bg-card/90 p-1.5 shadow-sm backdrop-blur" data-testid="rich-editor-toolbar">
        {groups.map((g, gi) => (
          <div key={gi} className={cn("flex items-center gap-0.5", gi > 0 && "border-s ps-1")}>
            {g.map((tool) => (
              <button
                key={tool.id}
                type="button"
                title={t(tool.ar, tool.en)}
                disabled={readOnly}
                onMouseDown={(e) => { e.preventDefault(); run(tool.run); }}
                className="grid size-8 place-items-center rounded-md text-stone-600 transition-colors duration-150 hover:bg-warm hover:text-terra disabled:opacity-40"
                data-testid={`editor-tool-${tool.id}`}
              >
                <tool.icon className="size-4" />
              </button>
            ))}
          </div>
        ))}
      </div>
      <div
        ref={ref}
        contentEditable={!readOnly}
        suppressContentEditableWarning
        onInput={emit}
        data-placeholder={placeholder}
        className="rich-editor min-h-[55vh] py-6 text-[16px] leading-[1.95]"
        data-testid="doc-content-editor"
      />
    </div>
  );
}
