import { useEffect, useRef, useState } from "react";
import { Loader2, Mic, Square, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { apiPostBlob, apiUploadBlob } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import type { Transcript } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Dictation: records the microphone and transcribes with Whisper (Arabic / French / English). */
export function MicButton({ onText, className, testId = "mic-button" }: { onText: (text: string) => void; className?: string; testId?: string }) {
  const { t, lang } = useI18n();
  const [state, setState] = useState<"idle" | "rec" | "busy">("idle");
  const rec = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"].find((m) => MediaRecorder.isTypeSupported(m)) ?? "";
      const r = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunks.current = [];
      r.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
      r.onstop = async () => {
        stream.getTracks().forEach((tr) => tr.stop());
        const type = r.mimeType || "audio/webm";
        const blob = new Blob(chunks.current, { type });
        if (blob.size < 1200) return setState("idle");
        setState("busy");
        try {
          const res = await apiUploadBlob<Transcript>("/speech/transcribe", blob, type.includes("mp4") ? "dictation.m4a" : "dictation.webm", { language: lang });
          if (res.text) onText(res.text);
          else toast.info(t("لم يُلتقط أي كلام", "No speech detected"));
        } catch {
          toast.error(t("تعذر تحويل الصوت إلى نص", "Could not transcribe"));
        } finally {
          setState("idle");
        }
      };
      r.start();
      rec.current = r;
      setState("rec");
    } catch {
      toast.error(t("اسمح باستعمال الميكروفون", "Allow microphone access"));
    }
  };
  const stop = () => rec.current?.state === "recording" && rec.current.stop();

  return (
    <button type="button" onClick={() => (state === "rec" ? stop() : state === "idle" ? void start() : undefined)} disabled={state === "busy"}
      title={state === "rec" ? t("إيقاف الإملاء", "Stop dictation") : t("إملاء صوتي", "Dictate")}
      className={cn("grid size-9 shrink-0 place-items-center rounded-full transition-colors duration-150",
        state === "rec" ? "animate-pulse bg-red-600 text-white" : "text-terra hover:bg-warm", className)}
      data-testid={testId} aria-pressed={state === "rec"}>
      {state === "busy" ? <Loader2 className="size-4 animate-spin" /> : state === "rec" ? <Square className="size-3.5 fill-current" /> : <Mic className="size-4" />}
    </button>
  );
}

let current: HTMLAudioElement | null = null;

/** Read-aloud with OpenAI TTS; clicking again stops playback. */
export function SpeakButton({ text, className, testId = "speak-button", label }: { text: () => string; className?: string; testId?: string; label?: string }) {
  const { t } = useI18n();
  const [state, setState] = useState<"idle" | "busy" | "play">("idle");
  const audio = useRef<HTMLAudioElement | null>(null);
  useEffect(() => () => { audio.current?.pause(); }, []);
  const run = async () => {
    if (state === "play") { audio.current?.pause(); setState("idle"); return; }
    const content = text().trim();
    if (!content) return;
    setState("busy");
    try {
      const blob = await apiPostBlob("/speech/tts", { text: content.slice(0, 20000), voice: "nova" });
      current?.pause();
      const a = new Audio(URL.createObjectURL(blob));
      audio.current = current = a;
      a.onended = () => setState("idle");
      await a.play();
      setState("play");
    } catch {
      toast.error(t("تعذرت القراءة الصوتية", "Could not read aloud"));
      setState("idle");
    }
  };
  return (
    <button type="button" onClick={() => void run()} disabled={state === "busy"} title={state === "play" ? t("إيقاف", "Stop") : t("استمع", "Listen")}
      className={cn("inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-xs text-muted-foreground transition-colors duration-150 hover:bg-warm hover:text-terra", className)}
      data-testid={testId}>
      {state === "busy" ? <Loader2 className="size-3.5 animate-spin" /> : state === "play" ? <Square className="size-3 fill-current" /> : <Volume2 className="size-3.5" />}
      {label}
    </button>
  );
}
