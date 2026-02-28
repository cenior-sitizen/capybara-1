import { CredibilityReportSchema, type CredibilityReport } from "@/lib/schemas";
import { detectLanguage } from "@/lib/language";
import { fetchAndExtractText } from "@/lib/url-extract";
import { getRelevantTrustedReferences } from "@/lib/trusted-sources";
import { generateCredibilityReportWithLLM, translateReportToLanguage } from "@/lib/llm";

export interface GenerateReportInput {
  inputType: "text" | "url";
  text: string;
  url?: string;
  targetLanguage: string;
}

export interface GenerateReportResult {
  report: CredibilityReport;
  claimSummary: string;
  originalLanguage: string;
  targetLanguage: string;
  sourceUrls: string[];
  translated?: Record<string, string>;
}

export async function generateCredibilityReport(
  input: GenerateReportInput
): Promise<GenerateReportResult> {
  let content = input.text;
  const sourceUrls: string[] = [];

  if (input.inputType === "url" && input.url) {
    try {
      content = await fetchAndExtractText(input.url);
      sourceUrls.push(input.url);
    } catch (err) {
      console.error("URL fetch failed:", err);
      content = input.text || "(Failed to fetch URL content. You may paste the text manually.)";
    }
  }

  const originalLanguage = detectLanguage(content);
  const claimSummary = content.slice(0, 2000).trim();
  const trustedRefs = getRelevantTrustedReferences(claimSummary, 8);

  const report = await generateCredibilityReportWithLLM(claimSummary, trustedRefs, {
    targetLanguage: input.targetLanguage,
  });

  const validated = CredibilityReportSchema.parse(report);

  let translated: Record<string, string> | undefined;
  if (input.targetLanguage !== "en") {
    translated = await translateReportToLanguage(validated, input.targetLanguage);
  }

  return {
    report: validated,
    claimSummary,
    originalLanguage,
    targetLanguage: input.targetLanguage,
    sourceUrls,
    translated,
  };
}
