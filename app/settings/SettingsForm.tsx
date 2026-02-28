"use client";

import { useState, useEffect } from "react";

const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "zh", label: "中文" },
  { value: "ms", label: "Bahasa Melayu" },
  { value: "ta", label: "தமிழ்" },
];

const PREF_LANG_KEY = "verisg_preferred_language";
const CONSENT_SAVE_INPUT_KEY = "verisg_consent_save_input";

export default function SettingsForm() {
  const [preferredLanguage, setPreferredLanguage] = useState("en");
  const [consentSaveInput, setConsentSaveInput] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      setPreferredLanguage(localStorage.getItem(PREF_LANG_KEY) || "en");
      setConsentSaveInput(localStorage.getItem(CONSENT_SAVE_INPUT_KEY) === "true");
    }
  }, []);

  const handleLanguageChange = (value: string) => {
    setPreferredLanguage(value);
    if (typeof window !== "undefined") {
      localStorage.setItem(PREF_LANG_KEY, value);
    }
  };

  const handleConsentChange = (checked: boolean) => {
    setConsentSaveInput(checked);
    if (typeof window !== "undefined") {
      localStorage.setItem(CONSENT_SAVE_INPUT_KEY, checked ? "true" : "false");
    }
  };

  if (!mounted) return null;

  return (
    <form className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-700">
          Preferred report language
        </label>
        <select
          value={preferredLanguage}
          onChange={(e) => handleLanguageChange(e.target.value)}
          className="mt-1 rounded border border-slate-300 bg-white px-3 py-2 text-slate-800"
        >
          {LANGUAGE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={consentSaveInput}
            onChange={(e) => handleConsentChange(e.target.checked)}
            className="rounded border-slate-300"
          />
          <span className="text-sm text-slate-700">
            Allow saving my raw input when I save a report (for improving the service). By default,
            only a hash and the report are stored.
          </span>
        </label>
      </div>
    </form>
  );
}
