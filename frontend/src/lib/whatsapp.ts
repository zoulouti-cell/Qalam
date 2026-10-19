// WhatsApp click-to-chat: opens WhatsApp (app on Android/Windows, web otherwise) with a ready message.
export function waNumber(phone: string): string {
  const d = (phone || "").replace(/[^\d+]/g, "");
  if (/^0[5-7]\d{8}$/.test(d)) return `212${d.slice(1)}`;
  if (/^00\d{8,15}$/.test(d)) return d.slice(2);
  return d.replace(/^\+/, "");
}

/** Without a phone number WhatsApp asks which contact to send to. */
export const waLink = (phone: string, text: string) =>
  `https://wa.me/${waNumber(phone)}?text=${encodeURIComponent(text)}`;
