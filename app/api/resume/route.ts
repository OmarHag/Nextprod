export const runtime = "nodejs";

import { NextResponse } from "next/server";
// @ts-ignore
import PDFParser from "pdf2json";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const resume = formData.get("resume") as File | null;

    if (!resume) {
      return NextResponse.json({ error: "No resume uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await resume.arrayBuffer());
    const pdfParser = new PDFParser();

    const extractedText: string = await new Promise((resolve, reject) => {
      let text = "";

      pdfParser.on("pdfParser_dataError", (err: Error | { parserError: Error }) => {
        reject(err instanceof Error ? err : err.parserError);
      });

      pdfParser.on("pdfParser_dataReady", (pdfData: { Pages: Array<{ Texts: Array<{ R: Array<{ T: string }> }> }> }) => {
        pdfData.Pages.forEach((page) => {
          page.Texts.forEach((entry) => {
            const encodedText = entry.R[0]?.T ?? "";

            try {
              text += `${decodeURIComponent(encodedText)} `;
            } catch {
              text += `${encodedText} `;
            }
          });
        });

        resolve(text);
      });

      pdfParser.parseBuffer(buffer);
    });

    const cleanText = extractedText.replace(/\s+/g, " ").trim();

    if (cleanText.length < 20) {
      return NextResponse.json(
        { error: "Resume text is too short or cannot be extracted." },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, text: cleanText });
  } catch (err) {
    console.error("Resume API Error:", err);
    return NextResponse.json(
      { error: "Failed to process resume." },
      { status: 500 },
    );
  }
}
