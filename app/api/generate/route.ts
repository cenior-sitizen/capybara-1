import { NextResponse } from "next/server";
import { GenerateReportRequestSchema } from "@/lib/schemas";
import { generateCredibilityReport } from "@/lib/report-generation";
import { checkRateLimit } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import crypto from "crypto";

function hashInput(text: string): string {
  return crypto.createHash("sha256").update(text).digest("hex").slice(0, 32);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = GenerateReportRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { inputType, text, url, targetLanguage, saveReport } = parsed.data;

    const rateLimitKey =
      (req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "anonymous").split(",")[0].trim() || "anonymous";
    const { allowed, remaining } = checkRateLimit(rateLimitKey);
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Try again later." },
        { status: 429, headers: { "X-RateLimit-Remaining": String(remaining) } }
      );
    }

    const inputForSummary = inputType === "url" && url ? url : text;
    const result = await generateCredibilityReport({
      inputType,
      text: inputType === "url" ? "" : text,
      url: inputType === "url" ? url : undefined,
      targetLanguage,
    });

    let reportId: string | undefined;

    if (saveReport) {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const service = createServiceRoleClient();
        const inputHash = hashInput(inputForSummary + (url || ""));
        const { data: insertData, error } = await service.from("reports").insert({
          user_id: user.id,
          input_type: inputType,
          input_hash: inputHash,
          original_input: null,
          original_language: result.originalLanguage,
          target_language: result.targetLanguage,
          report_json: result.report as unknown as Record<string, unknown>,
          source_urls: result.sourceUrls,
        }).select("id").single();
        if (!error && insertData) reportId = insertData.id;
      }
    }

    return NextResponse.json({
      success: true,
      report: result.report,
      reportId,
      translated: result.translated,
      originalLanguage: result.originalLanguage,
    });
  } catch (err) {
    console.error("Generate report error:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Report generation failed" },
      { status: 500 }
    );
  }
}
