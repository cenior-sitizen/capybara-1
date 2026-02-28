# VeriSG

AI-powered credibility assessment for local and multilingual communities in Singapore. Check claims, URLs, and get context with trusted references.

## Features (MVP)

- **Check a claim**: Paste text (English or 中文; bonus Malay/Tamil). Get a credibility report.
- **Check a link**: Paste a URL; the app fetches content and analyses it.
- **Credibility report**: Rating (Likely True / Unclear / Likely Misleading / Likely False), confidence (0–100), reasons, context, and 3–8 trusted references.
- **Translation**: Report can be shown in English + selected language (e.g. 中文).
- **Save reports**: Sign in with magic link; save reports to history (optional).
- **Disclaimer**: "AI-assisted guidance; verify with official sources."

## Tech stack

- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API routes
- **Auth + DB**: Supabase (Email OTP / magic link)
- **LLM**: OpenAI (or compatible API); fallback heuristic report if no key
- **Trusted sources**: Curated allowlist (gov.sg, MOH, SPF, CNA, ST, WHO, etc.)

## Setup

### 1. Clone and install

```bash
git clone <repo>
cd capybara-1
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env.local` and fill in:

```bash
cp .env.example .env.local
```

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (for server-side insert of reports) |
| `LLM_API_KEY` | OpenAI (or compatible) API key |
| `LLM_MODEL` | Model name (e.g. `gpt-4o-mini`) |
| `SEARCH_API_KEY` | (Optional) External search API; if unset, only curated trusted sources are used |

### 3. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. In **Authentication** → **Providers**, enable **Email** (and Email OTP / magic link if available).
3. Run migrations to create `reports` and `sources_cache` tables:

   - In Supabase Dashboard: **SQL Editor** → paste and run the contents of  
     `supabase/migrations/20250228000000_create_reports_and_cache.sql`

   Or with Supabase CLI:

   ```bash
   npx supabase db push
   ```

4. Set **Site URL** and **Redirect URLs** in Auth settings (e.g. `http://localhost:3000`, `http://localhost:3000/auth/callback`).

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or the port shown in the terminal).

**Note:** If Supabase env vars are not set, the app still builds and runs; sign-in and saving reports will not work until you add them. Report generation works with or without `LLM_API_KEY` (uses a heuristic fallback when the key is missing).

## Project structure

- `app/` – Next.js App Router pages and API routes
  - `page.tsx` – Home: input (text/URL), language, generate report
  - `report/[id]/page.tsx` – Saved report (owner only)
  - `history/page.tsx` – List of saved reports
  - `settings/page.tsx` – Language and consent for saving input
  - `api/generate/route.ts` – Report generation endpoint
  - `auth/callback/route.ts` – Supabase auth callback
- `lib/` – Shared logic
  - `schemas.ts` – Zod request/response schemas
  - `report-generation.ts` – Pipeline: language detect, URL fetch, LLM, translation
  - `llm.ts` – OpenAI call and fallback report
  - `language.ts` – Language detection (heuristic + franc)
  - `url-extract.ts` – Fetch URL and extract main text
  - `trusted-sources.ts` – Curated allowlist and matching
  - `rate-limit.ts` – In-memory rate limit for `/api/generate`
  - `supabase/` – Browser and server Supabase clients, proxy for middleware
- `data/trusted-sources.json` – Curated list of trusted domains (gov.sg, MOH, CNA, etc.)
- `supabase/migrations/` – SQL for `reports` and `sources_cache`

## Adding trusted domains

Edit `data/trusted-sources.json`. Each entry:

```json
{
  "domain": "example.gov.sg",
  "name": "Example Agency",
  "url": "https://www.example.gov.sg",
  "topics": ["keyword1", "keyword2"]
}
```

Add `domain`, `name`, `url`, and `topics` (keywords used to match claims). Restart the dev server so the list is reloaded.

## Tests

```bash
npm run test
```

- `lib/__tests__/language.test.ts` – Language detection (e.g. Chinese heuristic).
- `lib/__tests__/schemas.test.ts` – Zod schema validation for report and request.
- `lib/__tests__/url-extract.test.ts` – URL fetch and main-text extraction.

## Safety and privacy

- Raw user input is **not** stored by default; only a hash and the report are stored when the user saves.
- Optional setting (Settings page) allows consent to store raw input when saving.
- Rate limiting is applied on `/api/generate` (per IP/key).
- Reports include a disclaimer and direct users to official sources.

## License

Use as per your project license.
