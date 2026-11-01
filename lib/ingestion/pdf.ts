import { PDFParse } from "pdf-parse";

export type ExtractedPage = {
  pageNumber: number;
  text: string;
};

const MAX_PDF_BYTES = 16 * 1024 * 1024;
const MAX_PDF_PAGES = 500;

export async function extractPdfPages(
  buffer: ArrayBuffer,
): Promise<ExtractedPage[]> {
  if (buffer.byteLength === 0 || buffer.byteLength > MAX_PDF_BYTES) {
    throw new Error("The handbook PDF is empty or exceeds the 16 MB limit.");
  }

  const parser = new PDFParse({ data: new Uint8Array(buffer) });

  try {
    const result = await parser.getText();

    if (result.total > MAX_PDF_PAGES) {
      throw new Error(`The PDF exceeds the ${MAX_PDF_PAGES}-page limit.`);
    }

    const pages = result.pages
      .map(({ num, text }) => ({
        pageNumber: num,
        text: text.replace(/\\s+/g, " ").trim(),
      }))
      .filter((page) => page.text.length > 0);

    if (pages.length === 0) {
      throw new Error("No selectable text was found in this PDF.");
    }

    return pages;
  } finally {
    await parser.destroy();
  }
}
