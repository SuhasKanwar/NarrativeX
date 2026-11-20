import PDFDocument from "pdfkit";
import { resolve as resolvePath } from "node:path";
import { stripResearchArtifact } from "../utils/researchArtifact";
import { writeReportMarkdown } from "./reportMarkdown";
import regularFont from "../../assets/fonts/DejaVuSans.ttf" with { type: "file" };
import boldFont from "../../assets/fonts/DejaVuSans-Bold.ttf" with { type: "file" };
import italicFont from "../../assets/fonts/DejaVuSans-Oblique.ttf" with { type: "file" };
import boldItalicFont from "../../assets/fonts/DejaVuSans-BoldOblique.ttf" with { type: "file" };

const fonts = { regular: regularFont, bold: boldFont, italic: italicFont, boldItalic: boldItalicFont };

type ReportMessage = {
  sender: string;
  content: string | null;
  createdAt: unknown;
};

const copy = {
  brand: "NarrativeX",
  document: "Research Brief",
  question: "Question",
  answer: "Research brief",
  generated: "Generated",
};

export function createResearchPdf(title: string | null, messages: ReportMessage[]) {
  return new Promise<Buffer>((resolve, reject) => {
    const document = new PDFDocument({ size: "A4", margin: 54, info: {
      Title: title || `${copy.brand} ${copy.document}`,
      Author: copy.brand,
    } });
    const chunks: Buffer[] = [];
    document.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    document.on("end", () => resolve(Buffer.concat(chunks)));
    document.on("error", reject);

    for (const [name, path] of Object.entries(fonts)) {
      document.registerFont(name, resolvePath(import.meta.dir, path));
    }
    document.font("bold").fontSize(11).fillColor("#647067").text(copy.brand.toUpperCase());
    document.moveDown(0.5).font("bold").fontSize(25).fillColor("#17201b")
      .text(title || copy.document);
    document.moveDown(0.4).font("regular").fontSize(9).fillColor("#647067")
      .text(`${copy.generated}: ${new Date().toISOString()}`);
    document.moveDown(1.5).strokeColor("#cad3cc").moveTo(54, document.y).lineTo(541, document.y).stroke();

    let questionNumber = 0;
    for (const message of messages) {
      const isQuestion = message.sender === "user";
      if (isQuestion) questionNumber += 1;
      if (document.y + 62 > document.page.maxY()) document.addPage();
      document.moveDown(1.3).font("bold").fontSize(10).fillColor("#647067")
        .text(`${isQuestion ? copy.question : copy.answer} ${String(questionNumber).padStart(2, "0")}`.toUpperCase());
      document.moveDown(0.5);
      const content = message.content?.trim() || "No content.";
      if (isQuestion) {
        document.font("bold").fontSize(14).fillColor("#17201b").text(content, { lineGap: 3 });
      } else {
        writeReportMarkdown(document, stripResearchArtifact(content));
      }
    }

    document.end();
  });
}
