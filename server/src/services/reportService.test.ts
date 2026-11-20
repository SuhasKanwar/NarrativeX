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

test("formats a research table with a clickable citation and preserves Unicode and identifiers", async () => {
  const url = "https://example.org/article_with_underlines";
  const pdf = await createResearchPdf("Évaluation", [
    { sender: "user", content: "Compare raw_data and **literal text**.", createdAt: new Date() },
    { sender: "bot", createdAt: new Date(), content: [
      "# Results",
      "",
      "C1 → C2, 2 × 3, 25% — café and **source_quality**.",
      "",
      "| Measure | Score | Meaning |",
      "| --- | ---: | --- |",
      `| Diversity | 0.83 | [Source](<${url}>) |`,
      "| Coverage | 50% | A &amp; B \\| C |",
      "",
      "```narrativex-graph",
      '{"hidden":"internal_artifact"}',
      "```",
    ].join("\n") },
  ]);

  expect(pdf.includes(`/URI (${url})`)).toBe(true);

  const pdftotext = Bun.which("pdftotext");
  if (pdftotext) {
    const extraction = Bun.spawnSync([pdftotext, "-raw", "-", "-"], { stdin: pdf });
    expect(extraction.exitCode).toBe(0);
    const text = extraction.stdout.toString();
    expect(text).toContain("Compare raw_data and **literal text**.");
    expect(text).toContain("C1 → C2, 2 × 3, 25% — café and source_quality.");
    expect(text).toMatch(/Diversity\s+0\.83\s+Source/);
    expect(text).toMatch(/Coverage\s+50%\s+A & B \| C/);
    expect(text).not.toContain("| ---");
    expect(text).not.toContain("internal_artifact");
    expect(text).not.toContain(url);
  }
});

test.skipIf(!Bun.which("pdftotext"))("keeps table headers and evidence text across page breaks", async () => {
  const rows = Array.from({ length: 45 }, (_, index) => `| Finding ${index + 1} | 0.8 | Short source excerpt |`);
  rows.push(`| Long finding | 0.9 | ${"A full sentence from the original cited evidence. ".repeat(220)}End of excerpt. |`);
  const pdf = await createResearchPdf("Evidence", [{
    sender: "bot",
    content: ["| Measure | Score | Meaning |", "| --- | --- | --- |", ...rows].join("\n"),
    createdAt: new Date(),
  }]);
  const text = Bun.spawnSync(["pdftotext", "-raw", "-", "-"], { stdin: pdf }).stdout.toString();
  expect(text.match(/Measure Score Meaning/g)?.length).toBeGreaterThan(1);
  expect(text).toContain("Finding 45 0.8 Short source excerpt");
  expect(text).toContain("End of excerpt.");
});
