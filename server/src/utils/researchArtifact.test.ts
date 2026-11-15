import { expect, test } from "bun:test";
import { stripResearchArtifact } from "./researchArtifact";

test("removes graph storage data from report and model history without stripping prose", () => {
  expect(stripResearchArtifact('Report\n\n```narrativex-graph\n{"version":1}\n```')).toBe("Report");
  expect(stripResearchArtifact("Report without graph")).toBe("Report without graph");
});
