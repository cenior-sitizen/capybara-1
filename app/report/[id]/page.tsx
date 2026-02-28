import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import type { CredibilityReport } from "@/lib/schemas";

export default async function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/?signin=1");
  }

  const { data: row, error } = await supabase
    .from("reports")
    .select("id, report_json, target_language, created_at")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !row) {
    notFound();
  }

  const report = row.report_json as unknown as CredibilityReport;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-bold text-emerald-700">
            VeriSG
          </Link>
          <nav className="flex gap-4 text-sm">
            <Link href="/history" className="text-slate-600 hover:text-slate-900">
              History
            </Link>
            <Link href="/settings" className="text-slate-600 hover:text-slate-900">
              Settings
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10">
        <p className="mb-4 text-sm text-slate-500">
          Saved report · {new Date(row.created_at).toLocaleString()}
        </p>

        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="mb-4 text-xl font-semibold text-slate-800">Credibility Report</h1>

          {report.disclaimer && (
            <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
              {report.disclaimer}
            </p>
          )}

          <div className="mb-4 flex items-center gap-3">
            <span
              className={`rounded-full px-3 py-1 text-sm font-medium ${
                {
                  "Likely True": "bg-emerald-100 text-emerald-800",
                  Unclear: "bg-amber-100 text-amber-800",
                  "Likely Misleading": "bg-orange-100 text-orange-800",
                  "Likely False": "bg-red-100 text-red-800",
                }[report.rating] ?? "bg-slate-100 text-slate-700"
              }`}
            >
              {report.rating}
            </span>
            <span className="text-sm text-slate-600">Confidence: {report.confidence}%</span>
          </div>

          <section className="mb-4">
            <h2 className="mb-1 font-medium text-slate-700">Summary</h2>
            <p className="text-slate-600">{report.claimSummary}</p>
          </section>

          <section className="mb-4">
            <h2 className="mb-1 font-medium text-slate-700">Context</h2>
            <p className="text-slate-600">{report.context}</p>
          </section>

          <section className="mb-4">
            <h2 className="mb-1 font-medium text-slate-700">Reasons</h2>
            <ul className="list-inside list-disc space-y-1 text-slate-600">
              {report.reasons.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </section>

          <section className="mb-4">
            <h2 className="mb-1 font-medium text-slate-700">What to do next</h2>
            <p className="text-slate-600">{report.whatToDoNext}</p>
          </section>

          <section>
            <h2 className="mb-2 font-medium text-slate-700">Trusted references</h2>
            <ul className="space-y-2">
              {report.trustedReferences.map((ref, i) => (
                <li key={i}>
                  <a
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 hover:underline"
                  >
                    {ref.title}
                  </a>
                  {ref.snippet && (
                    <p className="text-sm text-slate-500">{ref.snippet}</p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        </article>

        <p className="mt-6">
          <Link href="/history" className="text-emerald-600 hover:underline">
            ← Back to history
          </Link>
        </p>
      </main>
    </div>
  );
}
