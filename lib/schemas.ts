import { z } from "zod";

export const CredibilityRating = z.enum([
  "Likely True",
  "Unclear",
  "Likely Misleading",
  "Likely False",
]);
export type CredibilityRating = z.infer<typeof CredibilityRating>;

export const TrustedReferenceSchema = z.object({
  url: z.string().url(),
  title: z.string(),
  snippet: z.string().optional(),
});

export const CredibilityReportSchema = z.object({
  rating: CredibilityRating,
  confidence: z.number().min(0).max(100),
  reasons: z.array(z.string()),
  context: z.string(),
  trustedReferences: z.array(TrustedReferenceSchema).min(3).max(8),
  whatToDoNext: z.string(),
  claimSummary: z.string(),
  disclaimer: z.string().optional(),
});

export type CredibilityReport = z.infer<typeof CredibilityReportSchema>;

export const GenerateReportRequestSchema = z.object({
  inputType: z.enum(["text", "url"]),
  text: z.string().max(50000).default(""),
  url: z.string().url().optional(),
  targetLanguage: z.enum(["en", "zh", "ms", "ta"]).default("en"),
  saveReport: z.boolean().default(false),
}).refine((d) => d.inputType !== "url" || d.url, { message: "URL required when inputType is url" })
  .refine((d) => d.inputType !== "text" || d.text.trim().length > 0, { message: "Text required when inputType is text" });

export type GenerateReportRequest = z.infer<typeof GenerateReportRequestSchema>;

export const GenerateReportResponseSchema = z.object({
  success: z.boolean(),
  report: CredibilityReportSchema.optional(),
  reportId: z.string().uuid().optional(),
  error: z.string().optional(),
});

export type GenerateReportResponse = z.infer<typeof GenerateReportResponseSchema>;
