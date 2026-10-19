import { Fragment, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, MessageSquarePlus, Send, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Pick } from "@/components/shared";
import { apiDelete, apiGet, apiPatch, apiPost, apiStream } from "@/lib/api";
import { useCases } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import type { Attachment, ChatMessage, Conversation, LibraryItem } from "@/lib/types";
import { cn } from "@/lib/utils";

// Minimal markdown: headings, bullets and **bold** — enough for legal answers.
function RichText({ text }: { text: string }) {
  return (
    <div className="space-y-2">
      {text.split("\n").map((line, i) => {
        const parts = line.replace(/^#{1,4}\s*/, "").split(/(\*\*[^*]+\*\*)/g).map((p, j) =>
          p.startsWith("**") && p.endsWith("**") ? <strong key={j}>{p.slice(2, -2)}</strong> : <Fragment key={j}>{p}</Fragment>);
        if (!line.trim()) return <div key={i} className="h-1" />;
        if (/^#{1,4}\s/.test(line)) return <p key={i} className="pt-1 font-bold">{parts}</p>;
        if (/^\s*[-*•]\s/.test(line)) return <p key={i} className="ps-4 before:me-2 before:text-terra before:content-['•']">{line.replace(/^\s*[-*•]\s/, "").split(/(\*\*[^*]+\*\*)/g).map((p, j) => p.startsWith("**") && p.endsWith("**") ? <strong key={j}>{p.slice(2, -2)}</strong> : <Fragment key={j}>{p}</Fragment>)}</p>;
        return <p key={i}>{parts}</p>;
      })}
    </div>
  );
}

export default function Assistant() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const [sp, setSp] = useSearchParams();
  const activeId = sp.get("c") ?? "";
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState<{ user: string; reply: string } | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const cases = useCases();
  const library = useQuery({ queryKey: ["library", "", "", ""], queryFn: () => apiGet<LibraryItem[]>("/library") });
  const convs = useQuery({ queryKey: ["conversations"], queryFn: () => apiGet<Conversation[]>("/conversations") });
  const conv = useQuery({ queryKey: ["conversation", activeId], queryFn: () => apiGet<Conversation>(`/conversations/${activeId}`), enabled: !!activeId });
  const active = conv.isError ? undefined : conv.data;
  const caseFiles = useQuery({
    queryKey: ["case-attachments", active?.case_id],
    queryFn: () => apiGet<Attachment[]>(`/cases/${active?.case_id}/attachments`),
    enabled: !!active?.case_id,
  });
  const readable = (caseFiles.data ?? []).filter((a) => /\.(pdf|docx|txt|png|jpe?g|webp)$/i.test(a.filename));
  const autoAsked = useRef("");

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [active?.messages.length, streaming?.reply]);

  const create = useMutation({
    mutationFn: () => apiPost<Conversation>("/conversations", { title: "", library_item_id: "", case_id: "", attachment_id: "" }),
    onSuccess: (c) => { qc.invalidateQueries({ queryKey: ["conversations"] }); setSp({ c: c.id }); },
  });
  const remove = useMutation({
    mutationFn: (id: string) => apiDelete(`/conversations/${id}`),
    onSuccess: (_, id) => { qc.invalidateQueries({ queryKey: ["conversations"] }); if (id === activeId) setSp({}); },
  });
  const setContext = useMutation({
    mutationFn: (body: { library_item_id: string; case_id: string; attachment_id: string }) => apiPatch<Conversation>(`/conversations/${activeId}`, { title: "", ...body }),
    onSuccess: (c) => qc.setQueryData(["conversation", c.id], c),
  });

  const send = async (text: string) => {
    if (!text.trim() || streaming) return;
    let id = activeId;
    if (!id) {
      const c = await apiPost<Conversation>("/conversations", { title: "", library_item_id: "", case_id: "", attachment_id: "" });
      id = c.id;
      setSp({ c: id });
    }
    setInput("");
    setStreaming({ user: text, reply: "" });
    try {
      await apiStream(`/conversations/${id}/messages`, { text }, (d) => setStreaming((s) => (s ? { ...s, reply: s.reply + d } : s)));
      await qc.invalidateQueries({ queryKey: ["conversation", id] });
      qc.invalidateQueries({ queryKey: ["conversations"] });
    } catch {
      toast.error(t("تعذر الحصول على إجابة، حاول مجدداً", "Could not get an answer, try again"));
      setInput(text);
    } finally {
      setStreaming(null);
    }
  };

  const messages: ChatMessage[] = active?.messages ?? [];

  // Opened from a case attachment ("analyse with assistant"): ask for the analysis once.
  useEffect(() => {
    if (sp.get("ask") !== "file" || !active || active.messages.length || autoAsked.current === active.id) return;
    autoAsked.current = active.id;
    void send(t(
      "اقرأ هذه الوثيقة ولخّصها: الأطراف، الوقائع، الطلبات، الحجج والدفوع الأساسية، وما ينبغي الانتباه إليه في الرد.",
      "Read this document and summarise it: parties, facts, claims, key arguments and defences, and what to watch for in our reply.",
    ));
  }, [active?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const suggestions = [
    t("ما هي آجال الطعن بالاستئناف في المادة المدنية؟", "What are the civil appeal deadlines?"),
    t("لخص لي شروط التطليق للشقاق في مدونة الأسرة", "Summarise divorce for discord under the Family Code"),
    t("استخرج الدفوع الشكلية الممكنة في دعوى أداء", "List possible procedural defences in a payment claim"),
  ];

  return (
    <div className="grid h-[calc(100vh-8.5rem)] gap-4 lg:grid-cols-[260px_1fr]">
      <aside className="hidden flex-col overflow-hidden rounded-2xl border bg-card lg:flex" data-testid="chat-history-sidebar">
        <div className="border-b p-3">
          <Button className="w-full" onClick={() => create.mutate()} data-testid="chat-new-conversation-button"><MessageSquarePlus className="size-4" />{t("محادثة جديدة", "New chat")}</Button>
        </div>
        <ul className="flex-1 space-y-1 overflow-y-auto p-2">
          {(convs.data ?? []).map((c) => (
            <li key={c.id} className="group flex items-center">
              <button onClick={() => setSp({ c: c.id })} data-testid="chat-history-item"
                className={cn("flex-1 truncate rounded-lg px-3 py-2 text-start text-sm transition-colors", c.id === activeId ? "bg-warm font-medium text-terra" : "hover:bg-muted")}>
                {c.title || t("محادثة جديدة", "New chat")}
              </button>
              <button onClick={() => remove.mutate(c.id)} className="p-1.5 opacity-0 transition-opacity group-hover:opacity-100" data-testid="chat-history-delete-button"><Trash2 className="size-3.5 text-muted-foreground" /></button>
            </li>
          ))}
        </ul>
      </aside>

      <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border bg-card">
        <div className="flex flex-wrap items-center gap-3 border-b p-3">
          <div className="flex items-center gap-2 font-bold"><Sparkles className="size-4 text-terra" />{t("المساعد القانوني", "Legal assistant")}</div>
          {active && (
            <div className="ms-auto flex flex-wrap gap-2">
              <div className="w-56">
                <Pick value={active.case_id} allowNone placeholder={t("بدون ملف", "No case")} testId="chat-context-case-picker"
                  onChange={(v) => setContext.mutate({ case_id: v, library_item_id: active.library_item_id, attachment_id: "" })}
                  options={(cases.data ?? []).map((c) => ({ value: c.id, label: `${c.file_number} — ${c.subject}` }))} />
              </div>
              <div className="w-56">
                <Pick value={active.library_item_id} allowNone placeholder={t("بدون مادة من المكتبة", "No library item")} testId="chat-context-library-picker"
                  onChange={(v) => setContext.mutate({ library_item_id: v, case_id: active.case_id, attachment_id: active.attachment_id })}
                  options={(library.data ?? []).map((it) => ({ value: it.id, label: it.title }))} />
              </div>
              {active.case_id && (
                <div className="w-56">
                  <Pick value={active.attachment_id} allowNone placeholder={t("كل وثائق الملف", "All case files")} testId="chat-context-file-picker"
                    onChange={(v) => setContext.mutate({ attachment_id: v, case_id: active.case_id, library_item_id: active.library_item_id })}
                    options={readable.map((a) => ({ value: a.id, label: a.filename }))} />
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex items-start gap-2 bg-[#FEF3C7] px-4 py-2 text-xs text-[#92400E]" data-testid="chat-disclaimer-notice">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
          {t("إجابات المساعد للمساعدة فقط ولا تغني عن رأي المحامي وتدقيقه في النصوص والاجتهادات.", "Answers are assistance only and do not replace the lawyer's own judgement and verification.")}
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-6" data-testid="chat-message-list">
          {messages.length === 0 && !streaming && (
            <div className="mx-auto mt-10 max-w-xl text-center animate-rise">
              <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-ink text-[#D4AF37]"><Sparkles className="size-6" /></div>
              <h2 className="mt-4 text-2xl font-bold">{t("كيف يمكنني مساعدتك اليوم؟", "How can I help today?")}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{t("اختر ملفاً أو مادة من المكتبة أعلاه لأعتمد عليها في الإجابة.", "Pick a case or library item above to ground my answers.")}</p>
              <div className="mt-6 grid gap-2">
                {suggestions.map((s) => (
                  <button key={s} onClick={() => void send(s)} className="rounded-xl border bg-paper px-4 py-3 text-start text-sm transition-colors hover:border-terra hover:text-terra" data-testid="chat-suggestion-button">{s}</button>
                ))}
              </div>
            </div>
          )}
          {[...messages, ...(streaming ? [{ role: "user", content: streaming.user, created_at: "" }, { role: "assistant", content: streaming.reply, created_at: "" }] as ChatMessage[] : [])].map((m, i) => (
            <div key={i} className={cn("flex", m.role === "user" ? "justify-start" : "justify-end")} data-testid={`chat-message-${m.role}`}>
              <div className={cn("max-w-[85%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed animate-rise",
                m.role === "user" ? "rounded-ss-sm bg-ink text-stone-50" : "rounded-se-sm border bg-paper")}>
                {m.role === "assistant" ? (
                  m.content ? <RichText text={m.content} /> : <span className="inline-block h-4 w-2 animate-blink bg-terra" />
                ) : <p className="whitespace-pre-wrap">{m.content}</p>}
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        <form className="flex items-end gap-2 border-t p-3" onSubmit={(e) => { e.preventDefault(); void send(input); }}>
          <Textarea rows={2} value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(input); } }}
            placeholder={t("اكتب سؤالك القانوني…", "Type your legal question…")} className="min-h-12 resize-none bg-paper" data-testid="chat-input-textarea" />
          <Button type="submit" size="icon-lg" disabled={!!streaming || !input.trim()} data-testid="chat-send-button"><Send className="size-4 rtl:-scale-x-100" /></Button>
        </form>
      </section>
    </div>
  );
}
