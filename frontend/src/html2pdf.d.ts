declare module "html2pdf.js" {
  import type { jsPDF } from "jspdf";
  interface Html2PdfWorker {
    set(opts: Record<string, unknown>): Html2PdfWorker;
    from(src: string | HTMLElement): Html2PdfWorker;
    toPdf(): Html2PdfWorker;
    get(key: "pdf"): Html2PdfWorker;
    then(fn: (pdf: jsPDF) => void): Html2PdfWorker;
    save(): Promise<void>;
  }
  const html2pdf: () => Html2PdfWorker;
  export default html2pdf;
}
