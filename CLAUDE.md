# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NuFounders Archetype Explorer is a career-transition survey that classifies users into one of 6 entrepreneurial archetypes, then delivers personalized AI summaries, promo codes, and branded certificates. It is a standalone app that communicates with the main NuFounders platform (`@NUFOUNDERS`) via webhooks and shared database references (`contactId`, `outreachId`).

## Commands

```bash
npm run dev           # Vite dev server at localhost:8080
npm run build         # Production build to ./dist
npm run lint          # ESLint
npm run test          # Vitest (run once)
npm run test:watch    # Vitest watch mode
```

No backend dev server is needed locally — API functions are Vercel serverless and only run in production or via `vercel dev`.

## Architecture

### Client (React SPA)

- **Entry:** `src/main.tsx` → `src/App.tsx` → `src/pages/Index.tsx`
- **Index.tsx** is the main orchestrator. It manages a 4-phase flow: `welcome` → `user-info` → `survey` → `results`, with each phase rendered by a component in `src/components/survey/`.
- **Routing:** React Router DOM 6, but the app is essentially single-page — `Index.tsx` handles all survey state internally via phase transitions.
- **State:** The `useSession` hook (`src/hooks/useSession.ts`) owns all session state. It syncs to both the API and localStorage (fallback). No global state library — everything flows through this hook.
- **Styling:** Tailwind CSS 3 + shadcn/ui (Radix primitives). Custom theme colors defined in `tailwind.config.ts` (warm, gold, navy).

### Server (Vercel Serverless Functions)

All API code lives in `api/` as standalone Vercel functions (not Express/tRPC):

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/session` | GET | Restore session by ID |
| `/api/session` | POST | Create new session (with geo lookup) |
| `/api/session` | PUT | Save answers + step progress |
| `/api/session` | PATCH | Save user info (name, email) |
| `/api/complete` | POST | Mark complete, generate promo, fire webhook |
| `/api/generate-results` | POST | Generate AI summary + certificate (background) |
| `/api/analytics` | POST | Batch event ingestion |
| `/api/migrate` | GET | One-shot DB migration (delete after use) |

Shared server utilities in `api/lib/`:
- `db.ts` — Neon PostgreSQL queries (raw SQL, no ORM)
- `ai.ts` — OpenAI gpt-4o-mini for personalized summaries
- `certificate.ts` — Cloudinary URL-based text overlay generation
- `promo.ts` — Nanoid-based promo code generator (`NF-XXXXX-XXXXX`)

### Core Business Logic

- **`src/data/archetypes.ts`** — Defines 6 archetypes and the `classifyArchetype()` rule-based decision tree. Classification uses Q1-Q5 answers (employment status, business interest, urgency, motivation, barriers).
- **`src/data/surveyQuestions.ts`** — 16 questions with conditional skip logic (e.g., Q2="not_pursuing" skips to Q6). Question types: `single`, `multi`, `dropdown`, `email-conditional`.

### Session Lifecycle

1. Mount → check localStorage for `nf_survey_session_id` → restore from API or create new
2. Progress → `PUT /api/session` on each step, answers saved to both localStorage and DB
3. Complete → `POST /api/complete` → promo code generated, webhook fired to main NuFounders app
4. Background → `POST /api/generate-results` → AI summary + certificate cached in session record
5. Return visit → session restored from API with full state

URL parameters: `?ref=<sessionId>` (referral), `?src=<channel>` (source), `?cid=<contactId>`, `?oid=<outreachId>`, `?reset=true` (retake)

### External Integrations

- **OpenAI** (gpt-4o-mini): Generates personalized summaries from survey answers + archetype
- **Cloudinary**: Certificate image generation via URL text overlays (1200x630)
- **NuFounders webhook**: `POST https://nufounders.com/api/webhooks/survey-completed` with 5s timeout, fires on completion and when step >= 3 ("survey-started" event)
- **ip-api.com**: Free geolocation for session metadata

### Database

Neon PostgreSQL (serverless), raw SQL queries. Three tables created lazily via `CREATE TABLE IF NOT EXISTS`:

- **`survey_sessions`** — Session state, answers (JSONB), archetype result, promo code, AI summary, certificate URL, geo data
- **`promo_codes`** — Generated codes with 15-day expiry, points value (1000 normal, 100 retake), redemption tracking
- **`survey_events`** — Analytics events (survey_start, step_viewed, step_answered, survey_completed, drop_off, etc.)

### Analytics

Client-side event batching (`src/lib/analytics.ts`) with 3s debounce. Auto-flushes on `beforeunload`/`visibilitychange` using `navigator.sendBeacon()`.

## Environment Variables

Required in `.env` (check `.env` for current values):
- `DATABASE_URL` — Neon PostgreSQL connection string
- `OPENAI_API` — OpenAI API key
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `NUFOUNDERS_WEBHOOK_URL` — Webhook endpoint on main NuFounders app
- `WEBHOOK_SECRET` — Shared secret for webhook auth

## Key Differences from Main NuFounders App

This app does **not** use tRPC, Drizzle ORM, wouter, Express, or pnpm. It uses:
- Raw SQL via `@neondatabase/serverless` (no ORM)
- React Router DOM (not wouter)
- Standalone Vercel functions (not tRPC adapter)
- npm (not pnpm)
- Vite dev server only — no local Express server
