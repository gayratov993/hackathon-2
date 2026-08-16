# TASKS

Quick-glance checklist per person. Full detail, rationale, and timelines live in
`docs/A.md`, `docs/B.md`, `docs/C.md`, `docs/D.md` and the rules in `docs/CLAUDE.md` — read
those before starting, this file is just the tracker.

Branch per person, merge into `main` at least every 45 minutes. Don't touch another
person's files — ping them in chat instead.

---

## Tasks for A — Foundation, Auth & Deploy
**Branch:** `feat/a-setup` (in progress on `Sinus`) · owns `vite.config.js`, `index.html`,
`src/index.css`, `src/App.jsx`, `src/main.jsx`, `src/lib/supabase.js`,
`src/context/AuthContext.jsx`, `src/pages/Login.jsx`, `supabase/schema.sql`, `.env.example`

- [x] Vite + Tailwind + daisyUI scaffold, `data-theme="emerald"`, stub pages/components
- [x] `src/lib/supabase.js` client singleton
- [x] `src/context/AuthContext.jsx` — session/user/loading, signUp/signIn/signOut
- [x] `App.jsx` routes + guards (no session → `/login`, zero meds → `/onboarding`)
- [x] `supabase/schema.sql` committed to repo
- [x] Create the Supabase project, run `schema.sql`, disable "Confirm email"
- [x] RLS proof: two test users via the Auth API, confirmed user2's read of `meds` returns zero
      rows after user1 inserted one — **still needs a UI screenshot once Login.jsx exists, D needs that for the video**
- [ ] Post `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` (anon only) to the team chat
- [ ] Railway service from the repo, build `npm run build`, output `dist/`, env vars set
- [ ] SPA fallback so `/week` doesn't 404 on refresh
- [ ] Supabase Auth → URL Configuration → add Railway URL to Site URL + Redirect URLs
- [ ] `src/pages/Login.jsx` — real email/password form, `alert alert-error` on failure
- [ ] After 12:30: integrator — merge B and C into `main`, redeploy after every merge, **13:00 feature freeze**

---

## Tasks for B — Today Screen & Schedule Logic
**Branch:** `feat/b-today` · owns `src/lib/schedule.js`, `src/components/DoseCard.jsx`, `src/pages/Today.jsx`
**Start now — no dependency on A.** Work against a hardcoded fixture until real data exists.

- [ ] `lib/schedule.js`: `buildDoseList(meds, logs, now)`, `calcStreak(logs, meds, today)`,
      `weekSummary(logs, meds, today)` — pure functions, no React/Supabase imports
  - [ ] Handle: med with two times/day, med added mid-week, a day with zero meds
  - [ ] **Post the function signatures to the group chat by 11:00** — C builds against them
- [ ] `components/DoseCard.jsx` — presentational, `{ dose, onTaken, onSkipped, busy }`
  - [ ] Four visual states: pending, overdue, taken, skipped; buttons only on pending/overdue
- [ ] `pages/Today.jsx` — fetch meds + today's logs, loading/empty/loaded states, optimistic
      taken/skipped logging via `upsert` with rollback + `alert alert-error` on failure
- [ ] All UI strings in Uzbek; state facts only — never advice or warnings

**Do not touch:** `context/`, `App.jsx`, `index.css` (A) · `Week.jsx`, `WeekGrid.jsx`,
`Onboarding.jsx`, `Settings.jsx`, `MedForm.jsx` (C)

---

## Tasks for C — Onboarding, Week & Settings
**Branch:** `feat/c-screens` · owns `src/pages/Onboarding.jsx`, `src/pages/Week.jsx`,
`src/pages/Settings.jsx`, `src/components/MedForm.jsx`, `src/components/WeekGrid.jsx`,
`src/components/EmptyState.jsx`, `src/components/Nav.jsx`
**Start now — no dependency on A.** Get B's `calcStreak`/`weekSummary` signatures at 11:00 and
build against a fixture until the real ones land.

- [ ] `components/MedForm.jsx` — Nomi / Miqdori / Vaqtlari (+ vaqt qo'shish), inline validation,
      no `alert()`, and the "biz kasallik nomini so'ramaymiz" microcopy under Nomi
- [ ] `components/EmptyState.jsx` + `components/Nav.jsx` (bottom `btm-nav`, active route highlighted)
- [ ] `pages/Onboarding.jsx` — one screen, `MedForm` → insert `meds` → navigate to `/`
- [ ] `pages/Week.jsx` + `components/WeekGrid.jsx` — 7-day grid, 4 cell states + legend, streak
      badge, one factual summary line, day-1 empty state copy
- [ ] `pages/Settings.jsx` — med list with edit + deactivate (never hard-delete),
      **"Barcha ma'lumotlarimni o'chirish"** with modal confirm — build this even under time pressure
- [ ] Data/privacy static text, copied from `CLAUDE.md` §4

**Do not touch:** `Today.jsx`, `DoseCard.jsx`, `lib/schedule.js` (B) · `App.jsx`, `context/`, `index.css` (A)

---

## Tasks for D — Seed, README, QA & Video
**Branch:** `feat/d-docs` · owns `README.md`, `scripts/seed.js`, `docs/` (script, screenshots)
**Do not touch anything under `src/`** — file bugs to whoever owns the file instead.

- [ ] Video script (skeleton in `D.md`), rehearsed out loud, target 3:30, hard range 3:00–4:00
- [ ] README: problem, who it's for, screenshots, stack, setup steps
      (`.env.example` → `npm i` → `npm run dev`), schema, data/privacy section from `CLAUDE.md` §4
- [ ] `scripts/seed.js` — idempotent, inserts 2 meds + 6 backdated days of logs, **two deliberate
      gaps** (one skipped, one missing) — can be written against the schema before UI exists
- [ ] Document demo account credentials in team chat, **not in the repo**
- [ ] QA on the **deployed** URL (not localhost): fresh signup → logged dose, `/week` and
      `/settings` refresh with no 404, 375px on a real phone, error states don't crash,
      `grep -rn "console.log" src/` empty, no `service_role` key or `.env.local` in git history,
      repo public (verify in a private window), no diagnosing/advising/warning text anywhere
- [ ] Record at 13:00 even if something's broken, two takes max
- [ ] Upload (YouTube unlisted/public, never private) and submit both links by **13:45**,
      verified in a private/incognito window

---

## Shared "done" bar (from CLAUDE.md)
- [ ] Steps 1–7 of the build order (CLAUDE.md §10) are the actual submission — cut from the
      bottom if time runs out, never reorder
- [ ] Repo is public before 14:00
- [ ] No `service_role` key anywhere in the repo
- [ ] Nothing that diagnoses, advises a dose, or warns about health
