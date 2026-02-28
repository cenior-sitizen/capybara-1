/**
 * Detect language of text. Returns ISO 639-1 code: en, zh, ms, ta, or 'en' as fallback.
 * Uses heuristics; optional franc/iso-639-1 can be added for more languages.
 */
export function detectLanguage(text: string): string {
  if (!text || text.length < 10) return "en";
  // Heuristic: Chinese characters => zh
  const chineseMatch = text.match(/[\u4e00-\u9fff]/g);
  if (chineseMatch && chineseMatch.length / Math.max(1, text.length) > 0.1) return "zh";
  // Tamil script
  if (/[\u0b80-\u0bff]/.test(text)) return "ta";
  return "en";
}

export const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  zh: "中文",
  ms: "Bahasa Melayu",
  ta: "தமிழ்",
};
