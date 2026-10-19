/* oxlint-disable react/only-export-components -- letterhead components + their print/PDF helpers live together */
import type { CSSProperties } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { fileUrl } from "@/lib/api";
import type { Letterhead } from "@/lib/types";

// Inline styles only: the same markup renders in-app, in the print window and in the PDF.
const FONT = "'IBM Plex Sans Arabic','IBM Plex Sans','Traditional Arabic',serif";
const GOLD_RULE: CSSProperties = { height: 2, background: "linear-gradient(90deg,#D4AF37,#B8912F 60%,#D4AF37)", marginTop: 10, border: 0 };
const PAGE_W = 210;
const PAGE_H = 297;
const MX = 18;
const PX_PER_MM = 96 / 25.4;

/** Image sources; when omitted the components load them from /api/attachments. */
export interface LetterheadImages { header?: string; footer?: string; page?: string; signature?: string; stamp?: string; logo?: string }

const src = (lh: Letterhead, images: LetterheadImages | undefined, slot: keyof LetterheadImages, logoId?: string) => {
  if (images && slot in images) return images[slot] ?? "";
  const id = slot === "logo" ? logoId : (lh[`${slot}_image_id` as keyof Letterhead] as string);
  return id ? fileUrl(id) : "";
};

export const isPageMode = (lh?: Letterhead | null) => !!lh?.page_image_id;

export function LetterheadHeader({ lh, images, logoId }: { lh: Letterhead; images?: LetterheadImages; logoId?: string }) {
  if (isPageMode(lh)) return null; // the uploaded blank letterhead already carries the header
  const img = src(lh, images, "header");
  const logo = lh.show_office_logo ? src(lh, images, "logo", logoId) : "";
  const contact = [lh.address, lh.phone, lh.email].filter(Boolean).join("  ·  ");
  const center = lh.align === "center";
  const hasText = !!(lh.office_name || lh.subtitle || contact);
  return (
    <div style={{ fontFamily: FONT, textAlign: center ? "center" : "start", color: "#0B1F18", paddingBottom: 6 }} data-testid="letterhead-header-block">
      {img && <img src={img} alt="" style={{ display: "block", width: "100%", maxHeight: 170, objectFit: "contain", margin: center ? "0 auto" : undefined }} />}
      {(hasText || logo) && (
        <div style={{ marginTop: img ? 6 : 0, display: "flex", flexDirection: center ? "column" : "row", alignItems: "center", gap: center ? 6 : 14 }}>
          {logo && <img src={logo} alt="" style={{ height: 64, width: "auto", objectFit: "contain" }} />}
          <div style={{ flex: center ? undefined : 1 }}>
            {lh.office_name && <div style={{ fontSize: 22, fontWeight: 700, color: "#0E3B2B", lineHeight: 1.4 }}>{lh.office_name}</div>}
            {lh.subtitle && <div style={{ fontSize: 13, color: "#9C7A22", marginTop: 2, lineHeight: 1.6 }}>{lh.subtitle}</div>}
            {contact && <div style={{ fontSize: 11, color: "#57534E", marginTop: 4, lineHeight: 1.6 }}>{contact}</div>}
          </div>
        </div>
      )}
      {(hasText || img || logo) && <div style={GOLD_RULE} />}
    </div>
  );
}

export function LetterheadFooter({ lh, images }: { lh: Letterhead; images?: LetterheadImages }) {
  if (isPageMode(lh)) return null;
  const img = src(lh, images, "footer");
  if (!img && !lh.footer_text) return null;
  return (
    <div style={{ fontFamily: FONT, textAlign: "center", color: "#57534E", fontSize: 10.5, lineHeight: 1.6, paddingTop: 6 }} data-testid="letterhead-footer-block">
      <div style={{ ...GOLD_RULE, height: 1, marginTop: 0, marginBottom: 6 }} />
      {lh.footer_text && <div style={{ whiteSpace: "pre-wrap" }}>{lh.footer_text}</div>}
      {img && <img src={img} alt="" style={{ display: "block", width: "100%", maxHeight: 90, objectFit: "contain", marginTop: 4 }} />}
    </div>
  );
}

export const hasSignature = (lh?: Letterhead | null) => !!(lh && (lh.signature_image_id || lh.stamp_image_id || lh.signer_name));

/** Signature + stamp, placed at the end of the document (left in Arabic, right in French). */
export function SignatureBlock({ lh, images }: { lh: Letterhead; images?: LetterheadImages }) {
  const sig = src(lh, images, "signature");
  const stamp = src(lh, images, "stamp");
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 28, fontFamily: FONT }} data-testid="signature-block">
      <div style={{ textAlign: "center", minWidth: 190, position: "relative" }}>
        {lh.signer_name && <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{lh.signer_name}</div>}
        <div style={{ position: "relative", height: 110, display: "flex", justifyContent: "center", alignItems: "center" }}>
          {stamp && <img src={stamp} alt="" style={{ position: "absolute", height: 105, width: "auto", opacity: 0.88 }} />}
          {sig && <img src={sig} alt="" style={{ position: "relative", height: 80, width: "auto" }} />}
        </div>
      </div>
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

/** Inline every image as a data URL so print windows, Word files and PDFs never depend on the network/session. */
export async function letterheadImages(lh?: Letterhead | null, logoId?: string): Promise<LetterheadImages> {
  if (!lh) return {};
  const load = (id?: string) => (id ? toDataUrl(fileUrl(id)) : Promise.resolve(undefined));
  const [header, footer, page, signature, stamp, logo] = await Promise.all([
    load(lh.header_image_id), load(lh.footer_image_id), load(lh.page_image_id), load(lh.signature_image_id), load(lh.stamp_image_id),
    load(lh.show_office_logo ? logoId : undefined),
  ]);
  return { header, footer, page, signature, stamp, logo };
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

export interface PrintJob { title: string; html: string; lh?: Letterhead | null; rtl: boolean; logoId?: string; signature?: boolean }

const bodyHtml = (job: PrintJob, images: LetterheadImages) =>
  job.html + (job.signature && job.lh && hasSignature(job.lh) ? renderToStaticMarkup(<SignatureBlock lh={job.lh} images={images} />) : "");

export function buildPrintHtml(job: PrintJob, images: LetterheadImages = {}) {
  const { title, lh, rtl } = job;
  const page = isPageMode(lh) && images.page;
  const head = lh ? (page ? `<div style="height:${lh.margin_top_mm}mm"></div>` : renderToStaticMarkup(<LetterheadHeader lh={lh} images={images} />)) : "";
  const foot = lh ? (page ? `<div style="height:${lh.margin_bottom_mm}mm"></div>` : renderToStaticMarkup(<LetterheadFooter lh={lh} images={images} />)) : "";
  // thead/tfoot repeat on every printed page; a fixed full-page image repeats as the blank-letterhead background.
  const pageCss = page ? `@page{size:A4;margin:0}body{padding:0 ${MX}mm}.bg{position:fixed;top:0;left:0;width:210mm;height:297mm;z-index:-1}` : `@page{size:A4;margin:12mm ${MX}mm}`;
  return `<!doctype html><html dir="${rtl ? "rtl" : "ltr"}"><head><meta charset="utf-8"><base href="${window.location.origin}/"><title>${esc(title)}</title>
<style>${fontFaceCss()}${pageCss}body{margin:0;${CONTENT_CSS};-webkit-print-color-adjust:exact;print-color-adjust:exact}table.page{width:100%;border-collapse:collapse}table.page td{padding:0;vertical-align:top}.content{padding:6mm 0}${INNER_CSS}</style></head>
<body>${page ? `<img class="bg" src="${images.page}" alt="">` : ""}<table class="page"><thead><tr><td>${head}</td></tr></thead><tfoot><tr><td>${foot}</td></tr></tfoot><tbody><tr><td><div class="content">${bodyHtml(job, images)}</div></td></tr></tbody></table></body></html>`;
}

export async function printDocument(job: PrintJob) {
  const w = window.open("", "_blank");
  if (!w) return;
  const images = await letterheadImages(job.lh, job.logoId);
  w.document.write(buildPrintHtml(job, images));
  w.document.close();
  setTimeout(() => { w.focus(); w.print(); }, 600);
}

export async function downloadWord(job: PrintJob) {
  const images = await letterheadImages(job.lh, job.logoId);
  const blob = new Blob(["\ufeff", buildPrintHtml(job, images)], { type: "application/msword" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${job.title || "document"}.doc`;
  a.click();
  URL.revokeObjectURL(a.href);
}

async function waitImages(el: HTMLElement) {
  await Promise.all(Array.from(el.querySelectorAll("img")).map((img) => (img.complete ? null : new Promise((r) => { img.onload = img.onerror = r; }))));
}

/** Move a page cut up to the nearest fully transparent row so text lines are never sliced in half. */
function cleanCut(canvas: HTMLCanvasElement, y: number, h: number) {
  const scan = Math.min(Math.floor(h * 0.25), 400);
  const ctx = canvas.getContext("2d");
  if (!ctx || scan <= 0) return h;
  const data = ctx.getImageData(0, y + h - scan, canvas.width, scan).data;
  for (let row = scan - 1; row >= 0; row--) {
    let empty = true;
    for (let x = 0; x < canvas.width; x += 2) if (data[(row * canvas.width + x) * 4 + 3] > 8) { empty = false; break; }
    if (empty) return h - (scan - 1 - row);
  }
  return h;
}

/** Builds the PDF and returns it as a Blob (used by download and by the Android/Windows share sheet). */
export async function buildPdf(job: PrintJob): Promise<Blob> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import("html2canvas"), import("jspdf")]);
  const images = await letterheadImages(job.lh, job.logoId);
  const innerW = PAGE_W - 2 * MX;
  const dir = job.rtl ? "rtl" : "ltr";

  const render = async (markup: string, transparent: boolean) => {
    const host = document.createElement("div");
    host.dir = dir;
    host.style.cssText = `position:fixed;left:-10000px;top:0;width:${innerW * PX_PER_MM}px;${transparent ? "" : "background:#fff;"}${CONTENT_CSS}`;
    host.innerHTML = `<style>${INNER_CSS}</style>${markup}`;
    document.body.appendChild(host);
    await waitImages(host);
    const canvas = await html2canvas(host, { scale: 2, backgroundColor: transparent ? null : "#ffffff" });
    host.remove();
    return canvas;
  };
  const snap = async (markup: string) => {
    if (!markup) return null;
    const c = await render(markup, false);
    return { data: c.toDataURL("image/png"), h: (c.height / c.width) * innerW };
  };

  const page = isPageMode(job.lh) ? images.page : undefined;
  const head = job.lh && !page ? await snap(renderToStaticMarkup(<LetterheadHeader lh={job.lh} images={images} />)) : null;
  const foot = job.lh && !page ? await snap(renderToStaticMarkup(<LetterheadFooter lh={job.lh} images={images} />)) : null;
  const top = page && job.lh ? job.lh.margin_top_mm : 10 + (head ? head.h + 6 : 6);
  const bottom = page && job.lh ? job.lh.margin_bottom_mm : 10 + (foot ? foot.h + 4 : 6);

  const content = await render(bodyHtml(job, images), true);
  const pxPerMm = content.width / innerW;
  const slicePx = Math.floor((PAGE_H - top - bottom) * pxPerMm);
  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const slice = document.createElement("canvas");
  slice.width = content.width;

  for (let y = 0, first = true; y < content.height || first; first = false) {
    let h = Math.min(slicePx, content.height - y);
    if (y + h < content.height) h = cleanCut(content, y, h);
    if (!first) pdf.addPage();
    if (page) pdf.addImage(page, "PNG", 0, 0, PAGE_W, PAGE_H, undefined, "FAST");
    if (head) pdf.addImage(head.data, "PNG", MX, 10, innerW, head.h, undefined, "FAST");
    if (foot) pdf.addImage(foot.data, "PNG", MX, PAGE_H - 10 - foot.h, innerW, foot.h, undefined, "FAST");
    if (h > 0) {
      slice.height = h;
      const ctx = slice.getContext("2d")!;
      ctx.clearRect(0, 0, slice.width, h);
      ctx.drawImage(content, 0, y, content.width, h, 0, 0, content.width, h);
      pdf.addImage(slice.toDataURL("image/png"), "PNG", MX, top, innerW, h / pxPerMm, undefined, "FAST");
    }
    y += Math.max(h, 1);
  }
  return pdf.output("blob");
}

export async function exportPdf(job: PrintJob) {
  const blob = await buildPdf(job);
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${job.title || "document"}.pdf`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

/** Native share sheet (Android: WhatsApp, Gmail…; Windows: Mail, Nearby share). Returns false when unsupported. */
export async function sharePdf(job: PrintJob): Promise<boolean> {
  const file = new File([await buildPdf(job)], `${job.title || "document"}.pdf`, { type: "application/pdf" });
  if (!navigator.canShare?.({ files: [file] })) return false;
  await navigator.share({ files: [file], title: job.title });
  return true;
}
