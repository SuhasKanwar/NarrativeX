import PDFDocument from "pdfkit";

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

function plainText(markdown: string) {
  return markdown
    .replace(/\[([^\]]+)]\((https?:\/\/[^)]+)\)/g, "$1 ($2)")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/[*_`~]/g, "")
    .trim();
}

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

    document.font("Helvetica-Bold").fontSize(11).fillColor("#647067").text(copy.brand.toUpperCase());
    document.moveDown(0.5).font("Helvetica-Bold").fontSize(25).fillColor("#17201b")
      .text(title || copy.document);
    document.moveDown(0.4).font("Helvetica").fontSize(9).fillColor("#647067")
      .text(`${copy.generated}: ${new Date().toISOString()}`);
    document.moveDown(1.5).strokeColor("#cad3cc").moveTo(54, document.y).lineTo(541, document.y).stroke();

    let questionNumber = 0;
    for (const message of messages) {
      const isQuestion = message.sender === "user";
      if (isQuestion) questionNumber += 1;
      document.moveDown(1.3).font("Helvetica-Bold").fontSize(10).fillColor("#647067")
        .text(`${isQuestion ? copy.question : copy.answer} ${String(questionNumber).padStart(2, "0")}`.toUpperCase());
      document.moveDown(0.5).font(isQuestion ? "Helvetica-Bold" : "Helvetica")
        .fontSize(isQuestion ? 14 : 10.5).fillColor("#17201b")
        .text(plainText(message.content || "No content."), { lineGap: 3, link: undefined });
    }

    document.end();
  });
}
