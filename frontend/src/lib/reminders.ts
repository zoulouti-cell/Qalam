import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiGet } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import type { Appointment, Dashboard, Deadline } from "@/lib/types";

// Device-level reminders (installed app or open tab): hearings/appointments 1 day and 1 hour before,
// procedural deadlines 3 days before and on the last day. Uses the system notification centre
// (Android / Windows) through the service worker, plus an in-app toast.
const PREF = "qalam-reminders";
const FIRED = "qalam-reminders-fired";
const HOUR = 3_600_000;

export const remindersEnabled = () => localStorage.getItem(PREF) === "on" && "Notification" in window && Notification.permission === "granted";
export function setRemindersPref(on: boolean) {
  localStorage.setItem(PREF, on ? "on" : "off");
  window.dispatchEvent(new Event("qalam-reminders-changed"));
}

export async function notify(title: string, body: string, url = "/", tag?: string) {
  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg) return await reg.showNotification(title, { body, icon: "/icon-192.png", badge: "/favicon-32x32.png", tag, data: { url }, lang: document.documentElement.lang, dir: document.documentElement.dir as NotificationDirection });
  } catch {
    /* fall back below */
  }
  new Notification(title, { body, icon: "/icon-192.png", tag });
}

function fired(): Record<string, number> {
  try { return JSON.parse(localStorage.getItem(FIRED) ?? "{}"); } catch { return {}; }
}
function markFired(key: string) {
  const f = fired();
  const now = Date.now();
  for (const k of Object.keys(f)) if (now - f[k] > 14 * 24 * HOUR) delete f[k]; // prune
  f[key] = now;
  localStorage.setItem(FIRED, JSON.stringify(f));
}

const plus = (iso: string, n: number) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
// Appointment times are office-local (Africa/Casablanca); the device is assumed to be in Morocco.
const at = (date: string, time: string) => new Date(`${date}T${time || "09:00"}:00`).getTime();

export function useReminders() {
  const { t } = useI18n();
  const today = useQuery({ queryKey: ["dashboard"], queryFn: () => apiGet<Dashboard>("/dashboard") }).data?.today;
  const appts = useQuery({
    queryKey: ["reminder-appointments", today],
    queryFn: () => apiGet<Appointment[]>(`/appointments?start=${today}&end=${plus(today!, 2)}`),
    enabled: !!today,
    refetchInterval: 5 * 60_000,
  }).data;
  const deadlines = useQuery({ queryKey: ["deadlines", "open"], queryFn: () => apiGet<Deadline[]>("/deadlines?open=true"), refetchInterval: 10 * 60_000 }).data;

  useEffect(() => {
    const check = () => {
      if (!remindersEnabled()) return;
      const now = Date.now();
      const done = fired();
      const fire = (key: string, title: string, body: string, url: string) => {
        if (done[key]) return;
        markFired(key);
        void notify(title, body, url, key);
        toast.info(title, { description: body });
      };
      for (const a of appts ?? []) {
        const start = at(a.date, a.time);
        const where = [a.case_label, a.location].filter(Boolean).join(" — ");
        const url = a.case_id ? `/cases/${a.case_id}` : "/calendar";
        if (now >= start - 24 * HOUR && now < start - HOUR) fire(`${a.id}:24h`, t("غداً: {x}", "Tomorrow: {x}", { x: a.title }), `${a.time} ${where}`.trim(), url);
        if (now >= start - HOUR && now < start) fire(`${a.id}:1h`, t("بعد ساعة: {x}", "In one hour: {x}", { x: a.title }), `${a.time} ${where}`.trim(), url);
      }
      for (const d of deadlines ?? []) {
        const last = at(d.due_date, "08:00");
        const label = `${d.case_file_number} — ${d.label}`;
        if (now >= last - 3 * 24 * HOUR && now < last) fire(`${d.id}:3d`, t("أجل يقترب: {x}", "Deadline approaching: {x}", { x: label }), t("آخر أجل: {d}", "Last day: {d}", { d: d.due_date }), `/cases/${d.case_id}`);
        if (now >= last && now < last + 14 * HOUR) fire(`${d.id}:0d`, t("اليوم آخر أجل: {x}", "Last day today: {x}", { x: label }), d.due_date, `/cases/${d.case_id}`);
      }
    };
    check();
    const id = setInterval(check, 30_000);
    window.addEventListener("qalam-reminders-changed", check);
    return () => { clearInterval(id); window.removeEventListener("qalam-reminders-changed", check); };
  }, [appts, deadlines, t]);
}
