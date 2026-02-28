import OpenAI from "openai";
import {
  CredibilityReportSchema,
  type CredibilityReport,
} from "@/lib/schemas";

const DISCLAIMER =
  "AI-assisted guidance; verify with official sources.";

export async function generateCredibilityReportWithLLM(
  claimSummary: string,
  trustedRefs: { url: string; title: string; snippet?: string }[],
  options: { targetLanguage: string }
): Promise<CredibilityReport> {
  const apiKey = process.env.LLM_API_KEY;
  const model = process.env.LLM_MODEL || "gpt-4o-mini";
  if (!apiKey) {
    return fallbackReport(claimSummary, trustedRefs);
  }

  const openai = new OpenAI({ apiKey });
  const refsList = trustedRefs
    .map((r, i) => `${i + 1}. ${r.title}: ${r.url}`)
    .join("\n");

  const systemPrompt = `You are a neutral information credibility assistant for Singapore and multilingual communities. You do NOT definitively fact-check; you help users assess credibility and point to trusted sources.

Output a JSON object with exactly these keys (no markdown, no extra text):
- rating: one of "Likely True" | "Unclear" | "Likely Misleading" | "Likely False"
- confidence: number 0-100 (calibrated; use mid range when uncertain)
- reasons: array of short bullet reasons (evidence signals: source quality, cross-source agreement, date recency, sensational cues, missing attribution, etc.)
- context: short neutral explainer (2-4 sentences) of what the claim is about
- whatToDoNext: one short sentence (e.g. "Check official advisory" or "Look for date and source attribution")
- claimSummary: 1-3 sentence summary of the claim (neutral)

Do not generate or amplify misinformation. If content seems harmful, give neutral guidance and direct to official sources. Only cite from the provided trusted references list. No fake citations.`;

  const userPrompt = `Claim/content to assess:
---
${claimSummary.slice(0, 6000)}
---

Trusted references (cite only these by title/URL):
${refsList}

Return a single JSON object with: rating, confidence, reasons, context, whatToDoNext, claimSummary.`;

  try {
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });
    const raw = completion.choices[0]?.message?.content?.trim();
    if (!raw) throw new Error("Empty LLM response");
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    }
    const report = CredibilityReportSchema.parse({
      ...(typeof parsed === "object" && parsed !== null ? (parsed as Record<string, unknown>) : {}),
      trustedReferences: trustedRefs.slice(0, 8),
      disclaimer: DISCLAIMER,
    });
    return report;
  } catch (err) {
    console.error("LLM error:", err);
    return fallbackReport(claimSummary, trustedRefs);
  }
}

function fallbackReport(
  claimSummary: string,
  trustedRefs: { url: string; title: string; snippet?: string }[]
): CredibilityReport {
  return CredibilityReportSchema.parse({
    rating: "Unclear",
    confidence: 50,
    reasons: [
      "Automated analysis was not available; verify with official sources.",
      "Cross-check with trusted Singapore government and health sites.",
    ],
    context: `This is a summary of the content you submitted. VeriSG could not run full analysis. Please verify important claims with official sources (e.g. gov.sg, MOH, SPF).`,
    trustedReferences: trustedRefs.slice(0, 8).map((r) => ({
      url: r.url,
      title: r.title,
      snippet: r.snippet,
    })),
    whatToDoNext: "Check official advisories and primary sources before making decisions.",
    claimSummary: claimSummary.slice(0, 500) || "No summary available.",
    disclaimer: DISCLAIMER,
  });
}

export async function translateReportToLanguage(
  report: CredibilityReport,
  langCode: string
): Promise<Record<string, string>> {
  if (langCode === "en") return {};
  const apiKey = process.env.LLM_API_KEY;
  const model = process.env.LLM_MODEL || "gpt-4o-mini";
  if (!apiKey) return {};

  const openai = new OpenAI({ apiKey });
  const langNames: Record<string, string> = {
    zh: "Simplified Chinese",
    ms: "Malay",
    ta: "Tamil",
  };
  const lang = langNames[langCode] || "Chinese";

  const toTranslate = [
    `Rating: ${report.rating}`,
    `Context: ${report.context}`,
    `What to do next: ${report.whatToDoNext}`,
    ...report.reasons.map((r) => r),
  ].join("\n");

  try {
    const res = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: `Translate the following text to ${lang}. Keep the same structure (lines starting with "Rating:", "Context:", "What to do next:", and bullet reasons). Return only the translated text.`,
        },
        { role: "user", content: toTranslate },
      ],
      temperature: 0.2,
    });
    const translated = res.choices[0]?.message?.content?.trim() || "";
    const lines = translated.split("\n");
    const result: Record<string, string> = {};
    let reasons: string[] = [];
    for (const line of lines) {
      if (line.startsWith("Rating:")) result.rating = line.replace(/^Rating:\s*/i, "").trim();
      else if (line.startsWith("Context:")) result.context = line.replace(/^Context:\s*/i, "").trim();
      else if (line.startsWith("What to do next:")) result.whatToDoNext = line.replace(/^What to do next:\s*/i, "").trim();
      else if (line.trim()) reasons.push(line.replace(/^[-*]\s*/, "").trim());
    }
    if (reasons.length) result.reasons = reasons.join("\n");
    return result;
  } catch {
    return {};
  }
}
