import trustedSourcesData from "@/data/trusted-sources.json";

export interface TrustedSourceEntry {
  domain: string;
  name: string;
  url: string;
  topics: string[];
}

const trustedSources: TrustedSourceEntry[] = trustedSourcesData as TrustedSourceEntry[];

export function getTrustedSources(): TrustedSourceEntry[] {
  return trustedSources;
}

/** Match sources by keywords in claim/summary (simple word overlap). Returns 3–8 refs. */
export function getRelevantTrustedReferences(
  claimSummary: string,
  maxRefs: number = 8
): { url: string; title: string; snippet?: string }[] {
  const lower = claimSummary.toLowerCase();
  const words = lower.split(/\s+/).filter((w) => w.length > 2);
  const scored = trustedSources.map((s) => {
    let score = 0;
    for (const topic of s.topics) {
      if (lower.includes(topic.toLowerCase())) score += 2;
      if (words.some((w) => w.includes(topic.toLowerCase()) || topic.toLowerCase().includes(w)))
        score += 1;
    }
    return { ...s, score };
  });
  scored.sort((a, b) => b.score - a.score);
  const selected = scored.filter((s) => s.score > 0).slice(0, maxRefs);
  if (selected.length < 3) {
    // Ensure at least 3 refs: add top by default (gov.sg, moh, who)
    const defaultDomains = ["gov.sg", "moh.gov.sg", "who.int"];
    for (const d of defaultDomains) {
      if (selected.length >= maxRefs) break;
      const found = trustedSources.find((s) => s.domain === d);
      if (found && !selected.some((s) => s.domain === d)) {
        selected.push({ ...found, score: 0 });
      }
    }
  }
  return selected.slice(0, maxRefs).map((s) => ({
    url: s.url,
    title: s.name,
    snippet: undefined,
  }));
}
