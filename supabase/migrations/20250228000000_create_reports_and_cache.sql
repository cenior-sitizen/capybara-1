-- Reports: store only hash + report unless user opted in to store raw input
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  input_type TEXT NOT NULL CHECK (input_type IN ('text', 'url')),
  input_hash TEXT NOT NULL,
  original_input TEXT,
  original_language TEXT NOT NULL DEFAULT 'en',
  target_language TEXT NOT NULL DEFAULT 'en',
  report_json JSONB NOT NULL,
  source_urls JSONB NOT NULL DEFAULT '[]'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own reports"
  ON reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reports"
  ON reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Optional: sources cache for RAG (can be populated later)
CREATE TABLE IF NOT EXISTS sources_cache (
  url TEXT PRIMARY KEY,
  title TEXT,
  snippet TEXT,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  domain TEXT,
  content_hash TEXT
);

CREATE INDEX IF NOT EXISTS idx_sources_cache_domain ON sources_cache(domain);
