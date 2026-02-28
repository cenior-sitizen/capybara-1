export type ReportRow = {
  id: string;
  user_id: string | null;
  created_at: string;
  input_type: "text" | "url";
  input_hash: string;
  original_input: string | null;
  original_language: string;
  target_language: string;
  report_json: Record<string, unknown>;
  source_urls: string[];
};

export type SourcesCacheRow = {
  url: string;
  title: string | null;
  snippet: string | null;
  fetched_at: string;
  domain: string | null;
  content_hash: string | null;
};
