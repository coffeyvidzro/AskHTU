import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

export type ExtractedPage = {
  pageNumber: number;
  text: string;
};

const MAX_PDF_BYTES = 16 * 1024 * 1024;
const MAX_PDF_PAGES = 500;

export async function extractPdfPages(buffer: ArrayBuffer): Promise<ExtractedPage[]> {
  if (buffer.byteLength === 0 || buffer.byteLength > MAX_PDF_BYTES) {
    throw new Error("The handbook PDF is empty or exceeds the 16 MB limit.");
  }

  const document = await getDocument({
    data: new Uint8Array(buffer),
    useSystemFonts: true,
    isEvalSupported: false,
  }).promise;

  try {
    if (document.numPages > MAX_PDF_PAGES) {
      throw new Error(`The PDF exceeds the ${MAX_PDF_PAGES}-page limit.`);
    }

    const pages: ExtractedPage[] = [];

    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber);
      const content = await page.getTextContent();
      const text = content.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

      if (text.length > 0) {
        pages.push({ pageNumber, text });
      }

      page.cleanup();
    }

    if (pages.length === 0) {
      throw new Error("No selectable text was found in this PDF.");
    }

    return pages;
  } finally {
    await document.destroy();
  }
}
