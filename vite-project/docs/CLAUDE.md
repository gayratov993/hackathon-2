# CLAUDE.md

Guidance for Claude Code working in this repo. Read this before writing any code.

---

## 1. What we are building

**Dori Vaqti** — a medication-reminder and adherence tracker. One habit, done end to end.

A person adds the medicines they already take, sets the times, and every day the app shows
today's doses. They tap **Ichdim** (taken) or **O'tkazib yubordim** (skipped). Over the week
they get a simple 7-day grid showing how consistent they were.

Hackathon topic: *Sog'liq, sport va tibbiyot*. Deadline **14:00, 16 Aug** — submission is a
public code link + a 3–4 minute video.

### Judging criteria this repo must satisfy
1. **One habit, finished** — not ten half-features. If a feature does not serve
   "remember the dose, log it, see the week", do not build it.
2. **Health data is sensitive** — store the minimum, and be able to explain why each column exists.
3. **No diagnosing, no treating** — we are a reminder, not medicine.
4. **Show a week** — the user's day 1 and day 7 must both be demoable today.

### Hard scope boundaries — do NOT build
- Symptom checkers, dosage advice, drug-interaction warnings, "is this pill safe" answers.
- Anything that reads like a diagnosis, or text that tells the user to change a dose.
- Diagnosis fields, condition names, doctor names, ID numbers, or free-text "what's wrong with me" notes.
- Social feed, chat, AI assistant, gamified points shop, dark/light theme switcher, i18n framework.
- Push notifications / service workers / cron jobs. Out of time budget. In-app reminders only.

If asked to add something outside this list, say it is out of scope and suggest the in-scope
alternative instead of silently building it.

---

## 2. Stack

| Layer | Choice |
|---|---|
| Build | Vite (React + JS) |
| Styling | Tailwind CSS + daisyUI (theme: `emerald`) |
| Backend | Supabase (Postgres + Auth + RLS) |
| Routing | react-router-dom |
| Dates | `date-fns` |
| Deploy | Railway (static site from `dist/`) |

No Redux, no React Query, no UI library other than daisyUI, no CSS files beyond `index.css`.
Do not add a dependency without it being necessary — every extra package is CodeReview risk.

### Commands
```bash
npm install
npm run dev       # local
npm run build     # produces dist/
npm run preview   # check the production build before pushing
```

---

## 3. Environment

`.env.local` (never committed — `.gitignore` must contain `.env*`):

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

`.env.example` **is** committed, with empty values. On Railway the same two vars are set in the
service Variables tab. Only ever use the **anon** key in this repo. If you ever see a
`service_role` key in client code, remove it and say so loudly.

---

## 4. Database

Run in the Supabase SQL editor. Every table is RLS-protected and scoped to `auth.uid()`.

```sql
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  created_at timestamptz default now()
);

create table meds (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  name text not null,              -- user's own label, e.g. "oq tabletka"
  dose_text text,                  -- free text the user typed, e.g. "1 tabletka"
  times time[] not null,           -- ['08:00','20:00']
  active boolean not null default true,
  created_at timestamptz default now()
);

create table med_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  med_id uuid not null references meds on delete cascade,
  scheduled_for timestamptz not null,
  status text not null check (status in ('taken','skipped')),
  logged_at timestamptz default now(),
  unique (med_id, scheduled_for)
);

alter table profiles  enable row level security;
alter table meds      enable row level security;
alter table med_logs  enable row level security;

create policy "own profile"  on profiles  for all using (auth.uid() = id)      with check (auth.uid() = id);
create policy "own meds"     on meds      for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own logs"     on med_logs  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

Keep this SQL in `supabase/schema.sql` in the repo — the jury should see it.

### Data rules (state these in the video)
- We store **no diagnosis, no condition, no doctor, no phone number**. `name` is whatever label
  the user chooses; we never suggest they enter a real drug name.
- A missed dose is **absence of a row**, not a stored judgement. Nothing is written unless the
  user taps.
- RLS means one user physically cannot read another's rows, even with the anon key.
- Settings has a **"Barcha ma'lumotlarimni o'chirish"** button that deletes the user's rows.
  This is a scoring feature, not a nice-to-have. Build it.

---

## 5. File structure

```
src/
  main.jsx
  App.jsx                 # routes + auth gate
  index.css               # tailwind directives only
  lib/
    supabase.js           # client singleton
    schedule.js           # pure functions: build today's dose list, streak, week grid
  context/
    AuthContext.jsx       # session, signIn, signUp, signOut
  components/
    DoseCard.jsx
    WeekGrid.jsx
    MedForm.jsx
    EmptyState.jsx
    Nav.jsx
  pages/
    Login.jsx
    Onboarding.jsx        # day 1: add your first medicine
    Today.jsx             # the main screen
    Week.jsx              # 7-day grid + streak
    Settings.jsx          # meds list, delete-my-data
supabase/schema.sql
```

Rules:
- All Supabase calls live in `pages/` or `context/` — **never inside a presentational component**.
- `lib/schedule.js` holds pure, testable logic (no imports from supabase or react).
- Components take props and render. No fetching in `components/`.

---

## 6. Code conventions

- Functional components, hooks only. One component per file, named export matching the filename.
- Every `await supabase...` call destructures `{ data, error }` and handles `error` — no silent
  failures. Show a daisyUI `alert alert-error` toast.
- Every async screen has three states: loading (`skeleton`), empty (`EmptyState`), loaded.
- Uzbek UI strings, hardcoded inline. No translation layer.
- No `console.log` in committed code. No commented-out blocks. No dead files.
- Comments explain *why*, not *what*. Aim for very few.
- daisyUI semantic classes (`btn btn-primary`, `card`, `badge`) over long Tailwind chains.
- Mobile-first: design at 375px, let it center on desktop with `max-w-md mx-auto`.

---

## 7. The week story (this is what wins Mahsulot + Taqdimot)

- **Day 1:** sign up → onboarding asks for one medicine, a dose label, and time(s) →
  lands on Today with the doses laid out. Empty week grid says "Birinchi kuningiz. Ertaga bu
  yer to'la boshlaydi."
- **Day 3:** Today shows an overdue dose highlighted; streak badge shows 2.
- **Day 7:** Week page shows a filled 7×N grid, a streak count, and a plain-language line like
  "Bu hafta 18 dozadan 16 tasini belgiladingiz." No advice, no scolding, no health claims.

**Demo seeding:** write `scripts/seed.js` that inserts 6 days of backdated `med_logs` (with two
deliberate gaps) for the logged-in demo account. Without it we cannot show day 7 in the video.
Build this once Today and Week work — but before polishing anything.

---

## 8. Git

- `main` is protected in practice: only merge working code into it.
- One branch per person, named `feat/<name>-<area>`.
- Small commits, present-tense messages: `add week grid`, `fix rls policy on med_logs`.
- Merge into `main` at least every 45 minutes. Do not let branches diverge for 3 hours.
- Never commit `.env.local`, `dist/`, or `node_modules/`.
- Repo must be **public** before 14:00, with a README containing: problem, screenshots, stack,
  setup steps, and the data/privacy note from section 4.

---

## 9. Railway

- Root directory: repo root. Build: `npm run build`. Output/static: `dist/`.
- Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Variables, then redeploy.
- Add the deployed URL to Supabase → Auth → URL Configuration → Redirect URLs, or login breaks.
- SPA fallback: all routes must serve `index.html`, otherwise `/week` 404s on refresh.
- Deploy an early skeleton by ~11:30. Do not leave first deploy until 13:40.

---

## 10. Build order (do not reorder)

1. Vite + Tailwind + daisyUI running, deployed to Railway. (skeleton)
2. Supabase schema + RLS applied.
3. Auth: email/password sign up, sign in, sign out, route guard.
4. Onboarding → add med.
5. Today: list today's doses, tap to log taken/skipped, optimistic UI.
6. Week: 7-day grid + streak.
7. `scripts/seed.js`, then record the video with a seeded account.
8. Settings: med list, deactivate med, delete all my data.
9. README + polish. Only now touch spacing and colors.

If time runs out, cut from the bottom. Steps 1–7 are the submission.