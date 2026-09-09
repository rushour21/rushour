import { NextResponse } from "next/server";
// A side-effect import, required before PDFParse is used at all: it registers
// pdf-parse's own worker rather than leaving pdfjs-dist to resolve one
// through the bundler, which is what breaks under Turbopack. Paired with
// serverExternalPackages: ["pdf-parse"] in next.config.ts - both are needed.
import "pdf-parse/worker";

/**
 * POST /api/resume/extract
 *
 * Accepts a multipart upload with one file field ("resume") and returns its
 * extracted plain text. Extraction happens server-side (pdf-parse needs
 * Node, not the browser), but nothing is persisted here or anywhere else on
 * the server - the caller is responsible for storing the returned text
 * wherever it keeps profile data. That keeps this route stateless and this
 * feature independent of whether a given screen is backed by Mongo or by the
 * client-side stores the rest of the new UI uses.
 */
export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get("resume");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  }

  const MAX_BYTES = 8 * 1024 * 1024;
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File is too large (max 8MB)." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      const { PDFParse } = await import("pdf-parse");
      const parser = new PDFParse({ data: buffer });
      const parsed = await parser.getText();
      const text = parsed.text.trim();
      if (!text) {
        return NextResponse.json(
          { error: "Couldn't find any text in that PDF - it may be a scanned image." },
          { status: 422 },
        );
      }
      return NextResponse.json({ text });
    }

    // Plain text / markdown fallback - no parsing needed.
    if (file.type.startsWith("text/") || file.name.toLowerCase().endsWith(".txt")) {
      return NextResponse.json({ text: buffer.toString("utf-8").trim() });
    }

    return NextResponse.json(
      { error: "Upload a PDF or a plain text file." },
      { status: 415 },
    );
  } catch (err) {
    console.error("[resume/extract]", err);
    return NextResponse.json(
      { error: "Couldn't read that file. Try pasting the text instead." },
      { status: 422 },
    );
  }
}
