# A — Foundation, Auth & Deploy

**Branch:** `feat/a-setup`
**You are the unblocker.** Until 10:30 three people are waiting on you. Speed over polish.
**After 12:30 you are also the integrator** — all merges into `main` go through you.

---

## Timeline

### 10:00–10:30 — Scaffold (push to `main`, not a branch)

```bash
npm create vite@latest . -- --template react
npm i
npm i -D tailwindcss @tailwindcss/vite daisyui
npm i @supabase/supabase-js react-router-dom date-fns
```

- Tailwind v4 via the Vite plugin. `src/index.css` gets `@import "tailwindcss";` and
  `@plugin "daisyui";` — nothing else ever goes in this file.
- Set `data-theme="emerald"` on `<html>` in `index.html`.
- `src/lib/supabase.js` — client singleton from `import.meta.env.VITE_SUPABASE_*`.
- Create **empty stub files** so nobody has import conflicts:
  `pages/Login.jsx`, `pages/Onboarding.jsx`, `pages/Today.jsx`, `pages/Week.jsx`,
  `pages/Settings.jsx`, `components/Nav.jsx`, `components/EmptyState.jsx`,
  `components/DoseCard.jsx`, `components/WeekGrid.jsx`, `components/MedForm.jsx`,
  `lib/schedule.js`, `context/AuthContext.jsx`.
  Each exports a named component returning a placeholder `<div>`.
- `App.jsx` — routes: `/login`, `/onboarding`, `/`, `/week`, `/settings`.
- `.gitignore` includes `.env*`, `dist/`, `node_modules/`. Commit `.env.example` with empty values.
- **Push to `main` and tell the group chat.** This is the deadline that matters most today.

### 10:30–11:00 — Supabase

- New project. Run `supabase/schema.sql` (in CLAUDE.md §4) in the SQL editor. Commit that file.
- Auth → disable "Confirm email". If confirmation is on, nobody can sign up during the demo.
- **RLS proof:** create two test users, insert a med as user 1, sign in as user 2, confirm the
  select returns zero rows. Screenshot it — D needs this for the video.
- Post `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to the team chat. Anon key only.

### 11:00–11:30 — Railway

- New service from the repo. Build `npm run build`, output `dist/`.
- Add both env vars, redeploy.
- SPA fallback so `/week` doesn't 404 on refresh.
- Supabase → Auth → URL Configuration → add the Railway URL to Site URL **and** Redirect URLs.
- Open the live URL on your phone. Post the link to the chat.

### 11:30–12:30 — Auth

- `context/AuthContext.jsx`: `session`, `user`, `loading`, `signUp`, `signIn`, `signOut`.
  Use `onAuthStateChange` + `getSession` on mount.
- `pages/Login.jsx`: email + password, one form toggling between sign-in and sign-up,
  daisyUI `alert alert-error` on failure, disabled button while pending.
- Route guard in `App.jsx`: no session → `/login`. Session but zero meds → `/onboarding`.
- On sign-up, insert the `profiles` row.

### 12:30 onwards — Integrator

- Merge B and C into `main`, resolve conflicts, redeploy, verify the live URL after every merge.
- **13:00: feature freeze.** After this you merge bug fixes only. Say no to new features.

---

## Files you own
`vite.config.js`, `index.html`, `src/index.css`, `src/App.jsx`, `src/main.jsx`,
`src/lib/supabase.js`, `src/context/AuthContext.jsx`, `src/pages/Login.jsx`,
`supabase/schema.sql`, `.env.example`

## Do not touch
`Today.jsx`, `DoseCard.jsx`, `lib/schedule.js` (B) · `Onboarding.jsx`, `Week.jsx`,
`Settings.jsx`, `MedForm.jsx`, `WeekGrid.jsx` (C) · `README.md`, `scripts/seed.js` (D)

## Done when
- [ ] Live Railway URL loads on a phone
- [ ] Sign up → sign out → sign in works on the deployed site, not just localhost
- [ ] Refreshing `/week` on the live URL does not 404
- [ ] RLS cross-account test passed and screenshotted
- [ ] No `service_role` key anywhere in the repo