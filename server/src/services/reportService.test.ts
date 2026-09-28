import { expect, test } from "bun:test";
import { createResearchPdf } from "./reportService";

test("creates a PDF research brief", async () => {
  const pdf = await createResearchPdf("AI regulation", [
    { sender: "user", content: "Compare coverage.", createdAt: new Date() },
    { sender: "bot", content: "# Finding\n\nSources **agree**.", createdAt: new Date() },
  ]);

  expect(pdf.subarray(0, 5).toString()).toBe("%PDF-");
  expect(pdf.length).toBeGreaterThan(1000);
});
