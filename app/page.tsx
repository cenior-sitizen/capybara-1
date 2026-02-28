"use client";

import Image from "next/image";
import { useState } from "react";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-4xl flex-col items-center gap-12 py-20 px-8 bg-white dark:bg-black">
        <header className="w-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image src="/next.svg" alt="logo" width={48} height={16} />
            <h1 className="text-2xl font-semibold">DeepFakeGuard</h1>
          </div>
          <nav className="text-sm text-zinc-600 dark:text-zinc-400">
            Scam detection · Deepfake video analysis · Trust signals
          </nav>
        </header>

        <section className="w-full flex flex-col items-center gap-6 text-center">
          <h2 className="text-4xl font-bold leading-tight">
            Detect deepfake scams in videos — fast and explainable
          </h2>
          <p className="max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
            Upload a short video clip and get a quick risk summary. DeepFakeGuard highlights probable
            manipulations and gives guidance to avoid social engineering and financial scams.
          </p>

          <DemoUploader />
        </section>

        <section className="w-full grid grid-cols-1 gap-6 sm:grid-cols-3">
          <Feature title="Quick Analysis" description="Upload and get results in seconds (demo stub)." />
          <Feature title="Explainable Scores" description="Confidence scores and short reasons to help decision making." />
          <Feature title="Safety Tips" description="Actionable steps when a video looks suspicious." />
        </section>

        <footer className="w-full text-sm text-zinc-500 dark:text-zinc-400">
          Built as a demo landing page for scam detection on deepfake videos.
        </footer>
      </main>
    </div>
  );
}

function Feature({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border p-6">
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
    </div>
  );
}

function DemoUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    if (!file) {
      setError("Please select a video file (short clip).");
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/analyze", {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Analysis failed");
      }

      const json = await res.json();
      setResult(json);
    } catch (err: any) {
      setError(err?.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl">
      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium">Demo video (mp4, mov) — keep clip &lt;10s</span>
        <input
          type="file"
          accept="video/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full rounded border px-3 py-2"
        />
      </label>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-black px-5 py-2 text-white disabled:opacity-60"
        >
          {loading ? "Analyzing…" : "Analyze Clip"}
        </button>

        {file && <span className="text-sm text-zinc-600 dark:text-zinc-400">{file.name}</span>}
      </div>

      <div className="mt-4">
        {error && <div className="text-sm text-red-600">{error}</div>}

        {result && (
          <div className="mt-3 rounded border p-4">
            <strong className="block">Result (demo):</strong>
            <pre className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">{JSON.stringify(result, null, 2)}</pre>
            <p className="mt-2 text-xs text-zinc-600">Note: integrate a backend analysis model for real detection.</p>
          </div>
        )}
      </div>
    </form>
  );
}
