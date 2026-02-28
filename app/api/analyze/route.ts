import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const f = form.get("file") as File | null;

    if (!f) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const size = Number((f as any).size ?? 0); // bytes
    // Simulated analysis (demo only). Larger files => slightly higher simulated risk.
    const scaled = Math.min(100, Math.round((size / (5_000_000)) * 100));
    const base = Math.max(0, scaled);
    const randomBias = Math.round(Math.random() * 30) - 10;
    const riskScore = Math.min(100, Math.max(0, base + randomBias));

    const riskLabel = riskScore > 60 ? "High" : riskScore > 30 ? "Medium" : "Low";

    const reasons = [
      "Temporal inconsistencies (simulated)",
      "Facial cues mismatch (simulated)",
      "Compression/artifact patterns (simulated)",
    ].slice(0, Math.max(1, Math.floor((riskScore / 50) * 3)));

    return NextResponse.json({
      fileName: (f as any).name ?? "uploaded",
      size,
      riskScore,
      riskLabel,
      reasons,
      note: "This is a demo stub. Integrate a detection model or third-party API for real analysis.",
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to analyze file" }, { status: 500 });
  }
}