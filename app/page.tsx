"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { CredibilityReport } from "@/lib/schemas";

const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "zh", label: "中文" },
  { value: "ms", label: "Bahasa Melayu" },
  { value: "ta", label: "தமிழ்" },
];

const NAV_LINKS = [
  { href: "/history", label: "History", color: "#f88cd4" },
  { href: "/settings", label: "Settings", color: "#def141" },
] as const;

function NavWithLine() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeLine, setActiveLine] = useState<{ width: number; left: number; color: string } | null>(null);

  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>, color: string) => {
    const el = e.currentTarget;
    const container = containerRef.current;
    if (!container) return;
    const cr = container.getBoundingClientRect();
    const lr = el.getBoundingClientRect();
    setActiveLine({
      width: lr.width,
      left: lr.left - cr.left,
      color,
    });
  };

  const handleMouseLeave = () => setActiveLine(null);

  return (
    <div ref={containerRef} className="relative flex items-center">
      {NAV_LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="relative px-3 py-2 text-sm text-white/80 transition hover:text-white md:px-4"
          onMouseEnter={(e) => handleMouseEnter(e, link.color)}
          onMouseLeave={handleMouseLeave}
        >
          {link.label}
        </Link>
      ))}
      <AuthButton />
      {activeLine && (
        <span
          className="absolute bottom-0 h-0.5 transition-all duration-200"
          style={{
            left: activeLine.left,
            width: activeLine.width,
            backgroundColor: activeLine.color,
          }}
        />
      )}
    </div>
  );
}

export default function Home() {
  const [mode, setMode] = useState<"text" | "url" | "media">("text");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaResult, setMediaResult] = useState<any | null>(null);
  const [targetLanguage, setTargetLanguage] = useState("en");
  const [saveReport, setSaveReport] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    report: CredibilityReport;
    reportId?: string;
    translated?: Record<string, string>;
    originalLanguage?: string;
  } | null>(null);
  const [showTranslation, setShowTranslation] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setMediaResult(null);

    if (mode === "media") {
      if (!mediaFile) {
        setError("Please select an image or video file.");
        return;
      }

      setLoading(true);
      try {
        const fd = new FormData();
        fd.append("file", mediaFile);
        const res = await fetch("/api/analyze", {
          method: "POST",
          body: fd,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to analyze media");
        setMediaResult(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Something went wrong during media analysis.");
      } finally {
        setLoading(false);
      }
      return;
    }

    const input = mode === "url" ? url.trim() : text.trim();
    if (!input) {
      setError(mode === "url" ? "Please enter a URL." : "Please enter or paste some text.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputType: mode,
          text: mode === "text" ? text : "",
          url: mode === "url" ? url : undefined,
          targetLanguage,
          saveReport,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate report");
      setResult({
        report: data.report,
        reportId: data.reportId,
        translated: data.translated,
        originalLanguage: data.originalLanguage,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0d0d12] text-white overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#0d0d12]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-6">
          <Link
            href="/"
            className="font-bold text-white transition-colors hover:text-[#e94560] text-lg md:text-xl"
            style={{ fontFamily: "var(--font-fahkwang), sans-serif" }}
          >
            VeriSG
          </Link>
          <NavWithLine />
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-28 pb-16 md:pt-36 md:pb-24">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e] via-transparent to-transparent pointer-events-none" />
        <div className="relative mx-auto max-w-6xl px-4 md:px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 lg:items-center">
            <div>
              <div className="mb-6 flex items-center gap-3">
                <span className="rounded-lg bg-white/10 px-3 py-1 text-sm text-[#def141]">
                  Credibility & media check
                </span>
              </div>
              <h1
                className="mb-4 text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl"
                style={{ fontFamily: "var(--font-fahkwang), sans-serif" }}
              >
                Check credibility of information
              </h1>
              <p className="mb-8 max-w-lg text-lg text-white/70">
                Paste a message, paragraph, or URL — or upload a social media image/video — and get an
                AI-assisted credibility summary with context and trusted references.
              </p>
              <a
                href="#check-form"
                className="inline-flex items-center gap-2 rounded-full bg-[#e94560] px-6 py-3 font-medium text-white transition hover:bg-[#d63a54]"
              >
                Get started
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
            <div className="flex justify-center lg:justify-end">
              <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl md:p-8">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-lg bg-[#5c31ff]/20 p-2">
                    <svg className="h-6 w-6 text-[#def141]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 12c0 7.879 6.38 14 13 14 4.418 0 8.18-2.62 9.618-6.24A11.955 11.955 0 0112 2.944z" />
                    </svg>
                  </div>
                  <span className="font-medium text-white" style={{ fontFamily: "var(--font-fahkwang), sans-serif" }}>
                    Text, URL, or media
                  </span>
                </div>
                <p className="text-sm text-white/60">
                  Start by entering content or uploading a clip. VeriSG gives you a structured report and
                  safety checklist — it does not make definitive claims.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Form + Report */}
      <main id="check-form" className="relative mx-auto max-w-4xl px-4 pb-24 md:px-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl md:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setMode("text")}
                className={`rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                  mode === "text"
                    ? "bg-[#5c31ff] text-white"
                    : "bg-white/10 text-white/80 hover:bg-white/15 hover:text-white"
                }`}
              >
                Check a claim (text)
              </button>
              <button
                type="button"
                onClick={() => setMode("url")}
                className={`rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                  mode === "url"
                    ? "bg-[#5c31ff] text-white"
                    : "bg-white/10 text-white/80 hover:bg-white/15 hover:text-white"
                }`}
              >
                Check a link (URL)
              </button>
              <button
                type="button"
                onClick={() => setMode("media")}
                className={`rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                  mode === "media"
                    ? "bg-[#5c31ff] text-white"
                    : "bg-white/10 text-white/80 hover:bg-white/15 hover:text-white"
                }`}
              >
                Check media (image / video)
              </button>
            </div>

            {mode === "text" && (
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste message, paragraph or social post (English or 中文)..."
                rows={5}
                className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-[#5c31ff] focus:outline-none focus:ring-1 focus:ring-[#5c31ff]"
              />
            )}

            {mode === "url" && (
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-[#5c31ff] focus:outline-none focus:ring-1 focus:ring-[#5c31ff]"
              />
            )}

            {mode === "media" && (
              <div className="space-y-2">
                <label className="text-sm text-white/70">
                  Upload an image or short video (demo analysis for AI-generated / deepfake likelihood).
                </label>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => setMediaFile(e.target.files?.[0] ?? null)}
                  className="block w-full rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-sm text-white file:mr-3 file:rounded-lg file:border-0 file:bg-white/20 file:px-3 file:py-2 file:text-sm file:text-white hover:file:bg-white/30"
                />
              </div>
            )}

            <div className="flex flex-wrap items-center gap-6">
              <label className="flex items-center gap-2">
                <span className="text-sm text-white/70">Report language (text/URL):</span>
                <select
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-sm text-white"
                >
                  {LANGUAGE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-[#1a1a2e] text-white">
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={saveReport}
                  onChange={(e) => setSaveReport(e.target.checked)}
                  className="rounded border-white/30 bg-white/10 text-[#5c31ff] focus:ring-[#5c31ff]"
                />
                <span className="text-sm text-white/70">Save text/URL reports to my history</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-[#e94560] px-6 py-3 font-medium text-white transition hover:bg-[#d63a54] disabled:opacity-60"
            >
              {loading
                ? mode === "media"
                  ? "Analyzing media…"
                  : "Generating report…"
                : mode === "media"
                  ? "Analyze media"
                  : "Generate report"}
            </button>

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}
          </form>

          {result && (
            <ReportView
              report={result.report}
              reportId={result.reportId}
              translated={result.translated}
              targetLanguage={targetLanguage}
              showTranslation={showTranslation}
              onToggleTranslation={() => setShowTranslation((v) => !v)}
            />
          )}

          {mediaResult && <MediaResultView result={mediaResult} />}
        </div>
      </main>

      <footer className="border-t border-white/10 py-6 text-center text-sm text-white/50">
        AI-assisted guidance; verify with official sources.
      </footer>
    </div>
  );
}

function AuthButton() {
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: u } }) => setUser(u ?? null));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    return () => subscription.unsubscribe();
  }, [supabase]);

  async function signIn() {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: window.prompt("Enter your email for magic link") || "",
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) alert(error.message);
      else alert("Check your email for the sign-in link.");
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
  }

  if (user) {
    return (
      <span className="ml-2 flex items-center gap-2 border-l border-white/20 pl-2 md:ml-4 md:pl-4">
        <span className="max-w-[120px] truncate text-sm text-white/70 md:max-w-[180px]">{user.email}</span>
        <button
          type="button"
          onClick={signOut}
          className="text-sm text-white/60 hover:text-white"
        >
          Sign out
        </button>
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={signIn}
      disabled={loading}
      className="ml-2 border-l border-white/20 pl-2 text-sm text-[#f88cd4] hover:underline disabled:opacity-60 md:ml-4 md:pl-4"
    >
      Sign in
    </button>
  );
}

function ReportView({
  report,
  reportId,
  translated,
  targetLanguage,
  showTranslation,
  onToggleTranslation,
}: {
  report: CredibilityReport;
  reportId?: string;
  translated?: Record<string, string>;
  targetLanguage: string;
  showTranslation: boolean;
  onToggleTranslation: () => void;
}) {
  const ratingStyles: Record<string, string> = {
    "Likely True": "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    Unclear: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    "Likely Misleading": "bg-orange-500/20 text-orange-300 border-orange-500/30",
    "Likely False": "bg-red-500/20 text-red-300 border-red-500/30",
  };

  return (
    <article className="mt-10 border-t border-white/10 pt-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-white" style={{ fontFamily: "var(--font-fahkwang), sans-serif" }}>
          Credibility Report
        </h2>
        {reportId && (
          <Link
            href={`/report/${reportId}`}
            className="text-sm text-[#def141] hover:underline"
          >
            Open saved report
          </Link>
        )}
      </div>

      {report.disclaimer && (
        <p className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          {report.disclaimer}
        </p>
      )}

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <span
          className={`rounded-full border px-3 py-1 text-sm font-medium ${
            ratingStyles[report.rating] ?? "bg-white/10 text-white/80 border-white/20"
          }`}
        >
          {report.rating}
        </span>
        <span className="text-sm text-white/60">Confidence: {report.confidence}%</span>
        {targetLanguage !== "en" && (
          <button
            type="button"
            onClick={onToggleTranslation}
            className="text-sm text-[#def141] hover:underline"
          >
            {showTranslation ? "Show English" : `Show ${targetLanguage === "zh" ? "中文" : targetLanguage}`}
          </button>
        )}
      </div>

      <section className="mb-6">
        <h3 className="mb-1 font-medium text-white/90">Summary</h3>
        <p className="text-white/70">
          {(showTranslation && translated?.claimSummary) ? translated.claimSummary : report.claimSummary}
        </p>
      </section>

      <section className="mb-6">
        <h3 className="mb-1 font-medium text-white/90">Context</h3>
        <p className="text-white/70">
          {showTranslation && translated?.context ? translated.context : report.context}
        </p>
      </section>

      <section className="mb-6">
        <h3 className="mb-1 font-medium text-white/90">Reasons</h3>
        <ul className="list-inside list-disc space-y-1 text-white/70">
          {report.reasons.map((r, i) => (
            <li key={i}>
              {showTranslation && translated?.reasons
                ? translated.reasons.split("\n")[i] ?? r
                : r}
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-6">
        <h3 className="mb-1 font-medium text-white/90">What to do next</h3>
        <p className="text-white/70">
          {showTranslation && translated?.whatToDoNext ? translated.whatToDoNext : report.whatToDoNext}
        </p>
      </section>

      <section>
        <h3 className="mb-2 font-medium text-white/90">Trusted references</h3>
        <ul className="space-y-2">
          {report.trustedReferences.map((ref, i) => (
            <li key={i}>
              <a
                href={ref.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#def141] hover:underline"
              >
                {ref.title}
              </a>
              {ref.snippet && (
                <p className="text-sm text-white/50">{ref.snippet}</p>
              )}
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}

function MediaResultView({ result }: { result: any }) {
  const { fileName, size, riskScore, riskLabel, reasons, note } = result || {};

  const mappedLabel =
    riskLabel === "High" ? "Likely AI-generated" : riskLabel === "Low" ? "Likely authentic" : "Unclear";

  return (
    <article className="mt-10 border-t border-white/10 pt-10">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-white" style={{ fontFamily: "var(--font-fahkwang), sans-serif" }}>
          Media analysis (demo)
        </h2>
      </div>
      <p className="mb-2 text-sm text-white/60">
        This is a prototype signal-only analysis based on file characteristics. Integrate a proper deepfake model
        for real detection.
      </p>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm font-medium text-white/90">
          {mappedLabel}
        </span>
        <span className="text-sm text-white/60">Confidence (heuristic): {Math.round(riskScore ?? 0)}%</span>
      </div>

      <div className="mb-4 text-sm text-white/70">
        <p>File: {fileName ?? "uploaded"}</p>
        {typeof size === "number" && <p>Size: {(size / (1024 * 1024)).toFixed(2)} MB</p>}
      </div>

      <section className="mb-4">
        <h3 className="mb-1 font-medium text-white/90">Evidence signals (simulated)</h3>
        <ul className="list-inside list-disc space-y-1 text-white/70">
          {(reasons as string[] | undefined)?.map((r, i) => <li key={i}>{r}</li>)}
        </ul>
      </section>

      {note && (
        <p className="text-xs text-white/50">
          {note}
        </p>
      )}
    </article>
  );
}
