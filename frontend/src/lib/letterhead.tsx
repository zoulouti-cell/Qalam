/* oxlint-disable react/only-export-components -- letterhead components + their print/PDF helpers live together */
import type { CSSProperties } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { fileUrl } from "@/lib/api";
import type { Letterhead } from "@/lib/types";

// The letterhead uses inline styles only: the same markup renders in-app, in the print window and in the PDF.
const FONT = "'IBM Plex Sans Arabic','IBM Plex Sans','Traditional Arabic',serif";
const GOLD_RULE: CSSProperties = { height: 2, background: "linear-gradient(90deg,#D4AF37,#B8912F 60%,#D4AF37)", marginTop: 10, border: 0 };

export interface LetterheadImages { header?: string; footer?: string }

export function LetterheadHeader({ lh, images }: { lh: Letterhead; images?: LetterheadImages }) {
  const src = images?.header ?? (lh.header_image_id ? fileUrl(lh.header_image_id) : "");
  const contact = [lh.address, lh.phone, lh.email].filter(Boolean).join("  ·  ");
  const align = lh.align === "center" ? "center" : "start";
  const hasText = !!(lh.office_name || lh.subtitle || contact);
  return (
    <div style={{ fontFamily: FONT, textAlign: align, color: "#0B1F18", paddingBottom: 6 }} data-testid="letterhead-header-block">
      {src && <img src={src} alt="" style={{ display: "block", width: "100%", maxHeight: 170, objectFit: "contain", margin: align === "center" ? "0 auto" : undefined }} />}
      {hasText && (
        <div style={{ marginTop: src ? 6 : 0 }}>
          {lh.office_name && <div style={{ fontSize: 22, fontWeight: 700, color: "#0E3B2B", lineHeight: 1.4 }}>{lh.office_name}</div>}
          {lh.subtitle && <div style={{ fontSize: 13, color: "#9C7A22", marginTop: 2, lineHeight: 1.6 }}>{lh.subtitle}</div>}
          {contact && <div style={{ fontSize: 11, color: "#57534E", marginTop: 4, lineHeight: 1.6 }}>{contact}</div>}
        </div>
      )}
      {(hasText || src) && <div style={GOLD_RULE} />}
    </div>
  );
}

export function LetterheadFooter({ lh, images }: { lh: Letterhead; images?: LetterheadImages }) {
  const src = images?.footer ?? (lh.footer_image_id ? fileUrl(lh.footer_image_id) : "");
  if (!src && !lh.footer_text) return null;
  return (
    <div style={{ fontFamily: FONT, textAlign: "center", color: "#57534E", fontSize: 10.5, lineHeight: 1.6, paddingTop: 6 }} data-testid="letterhead-footer-block">
      <div style={{ ...GOLD_RULE, height: 1, marginTop: 0, marginBottom: 6 }} />
      {lh.footer_text && <div style={{ whiteSpace: "pre-wrap" }}>{lh.footer_text}</div>}
      {src && <img src={src} alt="" style={{ display: "block", width: "100%", maxHeight: 90, objectFit: "contain", marginTop: 4 }} />}
    </div>
  );
}

// ---------- content helpers ----------
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
export const isHtml = (s: string) => /^\s*<(p|div|h[1-6]|ul|ol|br|span|b|strong|table)[\s>/]/i.test(s);
export const textToHtml = (text: string) => text.split("\n").map((l) => (l.trim() ? `<p>${esc(l)}</p>` : "<p><br></p>")).join("");
export const toHtml = (content: string) => (!content ? "" : isHtml(content) ? content : textToHtml(content));
export function htmlToText(html: string) {
  const el = document.createElement("div");
  el.innerHTML = html;
  el.querySelectorAll("p,div,h1,h2,h3,li,br").forEach((n) => n.after("\n"));
  return (el.textContent ?? "").replace(/\n{3,}/g, "\n\n").trim();
}

const CONTENT_CSS = `font-family:${FONT};font-size:14.5px;line-height:1.95;color:#111;`;
const INNER_CSS = `h1{font-size:1.5em;font-weight:700;margin:.4em 0}h2{font-size:1.25em;font-weight:700;margin:.4em 0}p{margin:0;min-height:1em}ul{list-style:disc;padding-inline-start:1.5em;margin:.3em 0}ol{list-style:decimal;padding-inline-start:1.5em;margin:.3em 0}`;

async function toDataUrl(url: string): Promise<string | undefined> {
  try {
    const blob = await (await fetch(url)).blob();
    return await new Promise((res) => {
      const r = new FileReader();
      r.onload = () => res(r.result as string);
      r.readAsDataURL(blob);
    });
  } catch {
    return undefined;
  }
}

export async function letterheadImages(lh?: Letterhead | null): Promise<LetterheadImages> {
  if (!lh) return {};
  const [header, footer] = await Promise.all([
    lh.header_image_id ? toDataUrl(fileUrl(lh.header_image_id)) : undefined,
    lh.footer_image_id ? toDataUrl(fileUrl(lh.footer_image_id)) : undefined,
  ]);
  return { header, footer };
}

function fontFaceCss() {
  let css = "";
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      for (const rule of Array.from(sheet.cssRules)) if (rule instanceof CSSFontFaceRule) css += rule.cssText;
    } catch {
      /* cross-origin sheet */
    }
  }
  return css;
}

export interface PrintJob { title: string; html: string; lh?: Letterhead | null; rtl: boolean }

export function buildPrintHtml({ title, html, lh, rtl }: PrintJob, images: LetterheadImages = {}) {
  const head = lh ? renderToStaticMarkup(<LetterheadHeader lh={lh} images={images} />) : "";
  const foot = lh ? renderToStaticMarkup(<LetterheadFooter lh={lh} images={images} />) : "";
  // thead/tfoot repeat on every printed page — the classic letterhead trick.
  return `<!doctype html><html dir="${rtl ? "rtl" : "ltr"}"><head><meta charset="utf-8"><base href="${window.location.origin}/"><title>${esc(title)}</title>
<style>${fontFaceCss()}@page{size:A4;margin:12mm 15mm}body{margin:0;${CONTENT_CSS}}table.page{width:100%;border-collapse:collapse}table.page td{padding:0;vertical-align:top}.content{padding:8mm 0}${INNER_CSS}</style></head>
<body><table class="page"><thead><tr><td>${head}</td></tr></thead><tfoot><tr><td>${foot}</td></tr></tfoot><tbody><tr><td><div class="content">${html}</div></td></tr></tbody></table></body></html>`;
}

export async function printDocument(job: PrintJob) {
  const w = window.open("", "_blank");
  if (!w) return;
  const images = await letterheadImages(job.lh);
  w.document.write(buildPrintHtml(job, images));
  w.document.close();
  setTimeout(() => { w.focus(); w.print(); }, 500);
}

export async function downloadWord(job: PrintJob) {
  const images = await letterheadImages(job.lh);
  const blob = new Blob(["\ufeff", buildPrintHtml(job, images)], { type: "application/msword" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${job.title || "document"}.doc`;
  a.click();
  URL.revokeObjectURL(a.href);
}

const PAGE_W = 210;
const PAGE_H = 297;
const MX = 15;
const PX_PER_MM = 3.7795;

async function waitImages(el: HTMLElement) {
  await Promise.all(Array.from(el.querySelectorAll("img")).map((img) => (img.complete ? null : new Promise((r) => { img.onload = img.onerror = r; }))));
}

export async function exportPdf(job: PrintJob) {
  const [{ default: html2pdf }, { default: html2canvas }] = await Promise.all([import("html2pdf.js"), import("html2canvas")]);
  const images = await letterheadImages(job.lh);
  const innerW = PAGE_W - 2 * MX;

  const snap = async (markup: string) => {
    if (!markup) return null;
    const host = document.createElement("div");
    host.dir = job.rtl ? "rtl" : "ltr";
    host.style.cssText = `position:fixed;left:-10000px;top:0;width:${innerW * PX_PER_MM}px;background:#fff`;
    host.innerHTML = markup;
    document.body.appendChild(host);
    await waitImages(host);
    const canvas = await html2canvas(host, { scale: 2, backgroundColor: "#ffffff" });
    host.remove();
    return { data: canvas.toDataURL("image/png"), h: (canvas.height / canvas.width) * innerW };
  };
  const head = job.lh ? await snap(renderToStaticMarkup(<LetterheadHeader lh={job.lh} images={images} />)) : null;
  const foot = job.lh ? await snap(renderToStaticMarkup(<LetterheadFooter lh={job.lh} images={images} />)) : null;
  const top = 10 + (head ? head.h + 6 : 4);
  const bottom = 10 + (foot ? foot.h + 4 : 4);
  const body = `<div dir="${job.rtl ? "rtl" : "ltr"}" style="${CONTENT_CSS}"><style>${INNER_CSS}</style>${job.html}</div>`;

  await html2pdf()
    .set({
      margin: [top, MX, bottom, MX],
      filename: `${job.title || "document"}.pdf`,
      image: { type: "jpeg", quality: 0.96 },
      html2canvas: { scale: 2, backgroundColor: "#ffffff" },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["css", "legacy"] },
    })
    .from(body)
    .toPdf()
    .get("pdf")
    .then((pdf) => {
      const n = pdf.getNumberOfPages();
      for (let i = 1; i <= n; i++) {
        pdf.setPage(i);
        if (head) pdf.addImage(head.data, "PNG", MX, 10, innerW, head.h);
        if (foot) pdf.addImage(foot.data, "PNG", MX, PAGE_H - 10 - foot.h, innerW, foot.h);
      }
    })
    .save();
}
