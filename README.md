# AI Market Signal Research Assistant

Research-only market intelligence console for discovering, validating, scoring, and reporting market opportunity signals.

The app does **not** build websites, deploy ideas, publish content, or execute business ideas. It only collects evidence, separates measured data from assumptions, scores opportunities, and presents investor-style reports for human review.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS dark research-console UI
- Supabase Postgres target database
- Prisma ORM
- DataForSEO keyword metrics
- SerpAPI Google SERP collection
- OpenAI structured JSON outputs for seed expansion and memo drafting
- Recharts dashboard charts
- Node test runner smoke tests, Vitest-ready unit setup, Playwright-ready e2e setup

## Environment

`.env` contains placeholders for Supabase. Replace these values before running database-backed flows:

```env
DATABASE_URL="postgresql://postgres:<password>@<project-ref>.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:<password>@<project-ref>.pooler.supabase.com:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://<project-ref>.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<anon-key>"
SUPABASE_SERVICE_ROLE_KEY="<service-role-key>"
```

Provider variables:

```env
OPENAI_API_KEY=
DATAFORSEO_LOGIN=
DATAFORSEO_PASSWORD=
SERPAPI_API_KEY=
OPENAI_MODEL=gpt-5.4-mini
```

For local dry runs without external provider calls, use the “Use mock providers” checkbox in the Start Research or Auto Discovery pages.

## Commands

```bash
npm install
npx prisma generate
npx prisma migrate dev
npm test
npm run lint
npm run build
npm run dev
```

## Pages

- `/` focused dashboard summary only
- `/research/start` manual research workflow
- `/research/auto-discovery` category-based signal discovery
- `/research/runs` audit log
- `/signals` signal feed
- `/signals/[id]` signal evidence detail
- `/opportunities` ranked opportunity clusters
- `/opportunities/[id]` investor memo and actions
- `/watchlist` watchlisted/approved ideas
- `/settings` scoring weights and thresholds
- `/data-sources` provider health
- `/usage` API usage and cost estimates

## Fact-First Policy

- Missing values remain unknown or `Data unavailable`.
- GPT cannot create search volume, CPC, keyword difficulty, revenue, TAM, or competition metrics.
- AI output is schema-constrained and checked for unsupported numeric claims.
- Scores are deterministic and formula-versioned.
- Weak evidence is downgraded to `insufficient_evidence` or partial confidence.

## Deployment Notes

Deploy as a Next.js app on Vercel after Supabase credentials and provider keys are configured. Run Prisma migrations against the Supabase database before production traffic.
