import { NodeHtmlMarkdown } from "node-html-markdown";

const MAX_TEXT_LENGTH = 15000;

/**
 * Fetch URL and extract main text content (readability-style). No storage.
 */
export async function fetchAndExtractText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": "VeriSG-Bot/1.0 (Info credibility checker)" },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
  const html = await res.text();
  return extractMainText(html).slice(0, MAX_TEXT_LENGTH);
}

/**
 * Extract main text from HTML: strip script/style, use body, convert to plain text.
 */
function extractMainText(html: string): string {
  try {
    const nhm = new NodeHtmlMarkdown();
    // Remove script/style to get cleaner text
    const cleaned = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
    const noStyle = cleaned.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");
    const markdown = nhm.translate(noStyle);
    const text = markdown
      .replace(/\s+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
    return text;
  } catch {
    // Fallback: strip tags
    return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, MAX_TEXT_LENGTH);
  }
}
