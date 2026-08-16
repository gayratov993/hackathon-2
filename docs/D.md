# D — Seed, README, QA & Video

**Branch:** `feat/d-docs`
**You own a full third of the score.** Taqdimot is its own category, and a broken or private
link scores zero on everything. You are not the "leftover" role — you are the one who makes the
other three people's work visible to the jury.

---

## Timeline

### 10:00–11:00 — Script and README first

Write the video script **before** the app exists. It forces the team to agree on what the demo
shows, and it's much easier to build toward a script than to narrate whatever you ended up with.

Script skeleton (3–4 minutes, aim for 3:30):

| Time | Content |
|---|---|
| 0:00–0:30 | The problem. One concrete person: someone who takes a pill twice a day and loses track by Thursday. Not statistics — a person. |
| 0:30–1:00 | What we built and the one decision behind it: one habit, finished, rather than ten features started. |
| 1:00–2:30 | Screen recording. Day 1: sign up → add one med → Today. Then switch to the seeded account: Day 7 → the filled week grid and streak. |
| 2:30–3:00 | Health data: what we store, what we deliberately don't, RLS, delete-my-data. Show A's cross-account screenshot. |
| 3:00–3:30 | What we'd build next, in one sentence. Close. |

Rehearse it out loud with a timer. Under 3:00 or over 4:00 loses points, and people always run long.

README (commit early, refine later): problem, who it's for, screenshots, stack, setup steps
(`.env.example` → `npm i` → `npm run dev`), the schema, and the data/privacy section from
CLAUDE.md §4. The jury reads this before they read code.

### 11:00–12:00 — `scripts/seed.js`

**Without this there is no day 7 and the video is half as strong.** You can write it against the
schema before any UI exists.

- Node script using `@supabase/supabase-js`, signs in as the demo account with the anon key.
- Inserts 2 meds (one once-daily, one twice-daily), then backdates 6 days of `med_logs`.
- **Leave two deliberate gaps** — a perfect grid looks fake and shows nothing. One skipped, one
  missing entirely.
- Idempotent: safe to run twice (the `unique (med_id, scheduled_for)` constraint helps).
- Document the demo account credentials in the team chat, not in the repo.

### 12:00–13:00 — QA on the **deployed** URL, not localhost

- [ ] Sign up as a fresh user on the live site, all the way to a logged dose
- [ ] Refresh on `/week` and `/settings` — no 404
- [ ] 375px width, real phone
- [ ] Wrong password, empty form, duplicate time — all show a readable error, none crash
- [ ] `grep -rn "console.log" src/` returns nothing
- [ ] No `service_role` key, no `.env.local` in git history
- [ ] Repo is **public**; open it in a private window to confirm
- [ ] No text anywhere that diagnoses, advises a dose, or warns about health

File bugs in the group chat with a screenshot and the exact steps. After 13:00 nobody is adding
features, so your bug list is the whole remaining backlog.

### 13:00–13:30 — Record

Record at 13:00 **even if something is broken.** A video of a working 80% beats a perfect app
with no link. Screen-record the phone-width browser window, clean desktop, no notifications.
Two takes maximum.

### 13:30–13:45 — Upload and submit

- YouTube: **Unlisted or Public**, never Private. Google Drive: "havolaga ega har kim ko'ra oladi".
- Open both the video link and the repo link in a **private/incognito window**. If either asks
  for login, the jury sees nothing and you score zero.
- Paste both into Space. Confirm the submission registered.

**Submit by 13:45.** The 14:00 cutoff is hard and the system stops accepting.

---

## Files you own
`README.md`, `scripts/seed.js`, `docs/` (script, screenshots)

## Do not touch
Any file under `src/` — report bugs to whoever owns the file instead.

## Done when
- [ ] Seeded demo account shows a realistic filled week
- [ ] Video is between 3:00 and 4:00
- [ ] Both links open in a private window
- [ ] Submitted on Space with time to spare