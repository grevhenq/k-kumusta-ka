# K? — Kumusta Ka?

A private, compassionate personal mental wellness tracking app: daily mood/symptom/sleep/medication/diary
tracking, a calendar, computed insights, a companion page, and a printable consultation report.

## What's actually implemented right now

Working, tested-by-hand in the browser, no backend required:

- Next.js 14 + TypeScript + Tailwind app shell, purple design system, sidebar (desktop) / bottom nav (mobile)
- **Home** — greeting, daily completion summary, quick-entry cards, "A little something for you" card
- **Mood** — 1–10 mood/energy/stress, emotion tags, notes, 14-entry trend chart, history, delete
- **Symptoms** — default + custom symptom library, 0–10 severity, notes, history, delete
- **Sleep** — bedtime/wake time pickers, duration calculated correctly across midnight, quality, history
- **Medications** — add medications with multiple scheduled dose times; mark each dose taken/skipped per day;
  unrecorded doses are never treated as missed
- **Diary** — autosaving free-text entries with save-status, per-day entry, history, delete
- **Calendar** — month grid showing how many of the 5 core categories were recorded each day; day detail view
- **Insights** — real descriptive statistics computed from your own stored records (average mood, a mood
  trend split, a descriptive sleep-vs-mood comparison when enough data exists, top logged symptoms). This is
  the evidence layer only — see "Not yet implemented" for the AI interpretation layer.
- **Companion** — tappable animated SVG shark placeholder, editable name, persisted setting
- **Reports** — date range + variable selection, consultation notes field, A4-styled print preview (uses the
  browser's own "Print to PDF")
- **Settings** — encouragement mode (personalized/private/off), diary AI consent toggle (currently just a
  gate — no provider is wired up yet), nickname, theme, clear-local-data
- PWA manifest + a minimal app-shell service worker (caches the shell only, never `/api/*`)

**Data persistence right now:** everything above is stored in the browser's `localStorage`
(`src/lib/storage.ts`), so the app is fully usable with zero configuration, but data does **not** sync across
devices and is not backed by Supabase yet.

## Not yet implemented (tracked honestly, not hidden)

- **Supabase auth + database wiring.** `supabase/schema.sql` contains the full relational schema for every
  table described in the spec (mood, symptoms, sleep, medications, doses, diary, encouragement messages,
  companion state, insights, experiments, reminders, report history) with Row Level Security policies
  restricting every row to `auth.uid()`. The schema is ready to deploy, but `src/lib/storage.ts` still reads
  and writes `localStorage` rather than calling Supabase. Swapping that file's internals (keeping its function
  signatures the same) is the main remaining step.
- **Server-side AI insight interpretation and diary-informed encouragement.** The statistics in Insights are
  real; the plain-language "headline + explanation" layer that an AI model would generate on top of them is
  not implemented — there's no `/api/insights` or `/api/encouragement` route yet. The Settings consent toggle
  and the Private/Personalized/Off modes are wired and ready for that route to be added.
  `AI_PROVIDER` / `AI_API_KEY` in `.env.example` are placeholders for it.
- **Real 3D shark companion (Three.js / React Three Fiber / Drei).** The Companion page currently ships a 2D
  animated SVG shark instead of a real 3D model with lighting/shadows/animation, and there's no progression,
  cosmetic unlocks, or accessory system yet.
- **True A4 PDF generation library** (e.g. `@react-pdf/renderer` or `pdf-lib`) for a one-click downloadable
  PDF with guaranteed pagination and page numbers. The current Reports page produces an A4-styled HTML preview
  and relies on the browser's native "Print to PDF," which is a reasonable fallback but not the dedicated
  pipeline the spec describes.
- **Push notifications and scheduled reminders.** No reminder settings UI, no push subscription, no
  service-worker push handling yet.
- **Personal experiments UI** (section 8.5) — schema exists (`personal_experiments` table), no UI yet.
- **Account deletion / data export**, app-lock, and other Section 14 security items beyond RLS in the schema.
- **Real app icons.** `public/icons/` has a placeholder note instead of actual 192×192 / 512×512 PNGs.
- Automated tests (unit tests for sleep-duration-across-midnight, dose-status logic, etc. are easy to add
  against `src/lib/storage.ts`'s pure functions, but none exist yet in this pass).

None of the above is claimed to work anywhere in the UI — where a feature is partial, the relevant page's code
comments and on-screen text say so explicitly.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000. No environment variables are required to use the app as-is (it runs entirely on
localStorage).

### Type-checking / linting

```bash
npm run typecheck
npm run lint
npm run build
```

## Connecting Supabase (when you're ready to move past localStorage)

1. Create a project at supabase.com.
2. In the SQL editor, run `supabase/schema.sql`.
3. Copy `.env.example` to `.env.local` and fill in `NEXT_PUBLIC_SUPABASE_URL` and
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` from your project's API settings.
4. Enable email (or your preferred) auth provider in Supabase Auth settings.
5. Update `src/lib/storage.ts` functions to call `getSupabaseBrowserClient()` (`src/lib/supabase.ts`) instead
   of `localStorage`, table by table. Keep the exported function names/signatures the same so the pages don't
   need to change.
6. Never put `SUPABASE_SERVICE_ROLE_KEY` in any client-side code or `NEXT_PUBLIC_*` variable — it's only for
   server-side API routes you add later (e.g. the AI insight pipeline).

## Deploying

This is a standard Next.js app — it deploys as-is to Vercel, Netlify, or any Node hosting that supports
Next.js 14. A GitHub repository alone does not give you a live URL: you still need to connect the repo to a
hosting provider and set the environment variables above there too (once Supabase is wired in).

For the iPhone 16 Pro Max / PWA install flow: once deployed over HTTPS, open the site in Safari, use Share →
Add to Home Screen. The manifest and safe-area CSS are already in place; real app icons still need to be
added to `public/icons/`.

## Project structure

```
src/
  app/            Next.js App Router pages (one folder per destination)
  components/     Nav, EncouragementCard, QuickEntryCard, RegisterSW
  lib/
    storage.ts    Local data layer (CRUD for every entity) — swap for Supabase calls
    supabase.ts   Browser Supabase client helper (not yet used by storage.ts)
supabase/
  schema.sql      Full relational schema + RLS policies for every table in the spec
public/
  manifest.json, sw.js, icons/
```

## Safety and privacy notes baked into the code

- Medication doses default to `unrecorded`, never `skipped` — see `doseStore` and the Medications page's
  on-screen disclaimer.
- The daily encouragement card never sends diary text anywhere unless `encouragementMode === "personalized"`
  and `diaryAIConsent` is true — and even then, no AI call exists yet to send it to.
- Insights only display statistics actually computed from stored records; nothing is invented.
- The service worker explicitly skips caching `/api/*` so sensitive responses (once that route exists) aren't
  left in a shared cache.
