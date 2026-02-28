import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function HistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: reports } = await supabase
    .from("reports")
    .select("id, created_at, input_type, report_json")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-bold text-emerald-700">
            VeriSG
          </Link>
          <nav className="flex gap-4 text-sm">
            <Link href="/settings" className="text-slate-600 hover:text-slate-900">
              Settings
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="mb-6 text-2xl font-bold text-slate-800">Saved reports</h1>

        {!reports?.length ? (
          <p className="text-slate-600">
            No saved reports yet. Generate a report on the home page and check &quot;Save report to my history&quot; to save it.
          </p>
        ) : (
          <ul className="space-y-3">
            {reports.map((r) => {
              const report = r.report_json as { rating?: string };
              return (
                <li key={r.id}>
                  <Link
                    href={`/report/${r.id}`}
                    className="block rounded-lg border border-slate-200 bg-white p-4 transition hover:border-emerald-300 hover:shadow"
                  >
                    <span className="font-medium text-slate-800">
                      {report?.rating ?? "Report"}
                    </span>
                    <span className="ml-2 text-sm text-slate-500">
                      {r.input_type} · {new Date(r.created_at).toLocaleString()}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        <p className="mt-8">
          <Link href="/" className="text-emerald-600 hover:underline">
            ← Back to home
          </Link>
        </p>
      </main>
    </div>
  );
}
