import { describe, it, expect } from "vitest";
import {
  CredibilityReportSchema,
  GenerateReportRequestSchema,
} from "../schemas";

describe("CredibilityReportSchema", () => {
  it("accepts valid report", () => {
    const report = {
      rating: "Likely True",
      confidence: 75,
      reasons: ["Source is official.", "Recent date."],
      context: "About health measures.",
      trustedReferences: [
        { url: "https://gov.sg", title: "Gov SG" },
        { url: "https://moh.gov.sg", title: "MOH" },
        { url: "https://who.int", title: "WHO" },
      ],
      whatToDoNext: "Check official sources.",
      claimSummary: "A claim was made.",
    };
    expect(CredibilityReportSchema.parse(report)).toEqual(report);
  });

  it("rejects invalid rating", () => {
    expect(() =>
      CredibilityReportSchema.parse({
        rating: "Invalid",
        confidence: 50,
        reasons: [],
        context: "x",
        trustedReferences: [
          { url: "https://a.com", title: "A" },
          { url: "https://b.com", title: "B" },
          { url: "https://c.com", title: "C" },
        ],
        whatToDoNext: "x",
        claimSummary: "x",
      })
    ).toThrow();
  });
});

describe("GenerateReportRequestSchema", () => {
  it("accepts text input", () => {
    const req = GenerateReportRequestSchema.parse({
      inputType: "text",
      text: "Some claim to check.",
      targetLanguage: "en",
    });
    expect(req.inputType).toBe("text");
    expect(req.text).toBe("Some claim to check.");
  });

  it("accepts url input", () => {
    const req = GenerateReportRequestSchema.parse({
      inputType: "url",
      text: "",
      url: "https://example.com",
      targetLanguage: "zh",
    });
    expect(req.inputType).toBe("url");
    expect(req.url).toBe("https://example.com");
  });

  it("rejects url input without url", () => {
    expect(() =>
      GenerateReportRequestSchema.parse({
        inputType: "url",
        text: "",
        targetLanguage: "en",
      })
    ).toThrow();
  });
});
