import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import SettingsForm from "./SettingsForm";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

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
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="mb-6 text-2xl font-bold text-slate-800">Settings</h1>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="mb-4 text-sm text-slate-600">
            Signed in as <strong>{user.email}</strong>
          </p>

          <SettingsForm />
        </div>

        <p className="mt-8">
          <Link href="/" className="text-emerald-600 hover:underline">
            ← Back to home
          </Link>
        </p>
      </main>
    </div>
  );
}
