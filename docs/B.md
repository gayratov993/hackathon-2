# B — Today Screen & Schedule Logic

**Branch:** `feat/b-today`
**You own the screen the jury looks at longest.** It is the heaviest piece — start at 10:00,
you do not need to wait for A.

---

## Timeline

### 10:00–11:00 — `lib/schedule.js` (no dependencies, start now)

Pure functions only. No React, no Supabase imports. This is the file CodeReview will like most,
so keep it clean and name things well.

```js
// meds: [{ id, name, dose_text, times: ['08:00','20:00'], active }]
// logs: [{ med_id, scheduled_for, status }]

buildDoseList(meds, logs, now)   // → [{ key, medId, medName, doseText, at: Date,
                                 //      status: 'taken'|'skipped'|'pending'|'overdue' }]
                                 // sorted by time; overdue = pending && at < now
calcStreak(logs, meds, today)    // → consecutive days back from today with ≥1 'taken'
weekSummary(logs, meds, today)   // → { taken, total, days: [{ date, taken, total }] } for 7 days
```

`key` should be `` `${medId}-${isoTime}` `` so React lists are stable and you can match a log
row to a dose slot.

Edge cases that will bite you: a med with two times a day, a med added mid-week (no expected
doses before `created_at`), and a day with zero meds. Handle all three — the demo hits the first two.

Work against a hardcoded fixture array at the top of the file while A finishes the scaffold.

### 11:00–11:45 — `components/DoseCard.jsx`

Presentational. Props: `{ dose, onTaken, onSkipped, busy }`. No fetching in here, ever.

- daisyUI `card` layout, med name large, dose label as `badge badge-ghost`, time on the right.
- Four visual states: pending (neutral), overdue (`border-warning`), taken (`badge-success`,
  muted card), skipped (muted, struck-through time).
- Two buttons on pending/overdue only: **Ichdim** (`btn-primary`) and
  **O'tkazib yubordim** (`btn-ghost`). Disabled while `busy`.
- Tap targets ≥ 44px. Design at 375px width.

### 11:45–12:45 — `pages/Today.jsx`

- Fetch `meds` (active) and today's `med_logs` in one `useEffect`, pass through `buildDoseList`.
- Three states: `skeleton` while loading → `EmptyState` if no meds → the dose list.
- Header: today's date in Uzbek, streak badge from `calcStreak`, and a line like
  `Bugun: 2 / 3`.
- Logging a dose: **optimistic update** — set local state first, then
  `supabase.from('med_logs').upsert({...}, { onConflict: 'med_id,scheduled_for' })`.
  On `error`, roll the state back and show an `alert alert-error`.
- Destructure `{ data, error }` on every call. No silent failures, no `console.log` left behind.

### 12:45–13:00 — Polish, then merge to A

---

## Language rules
All strings in Uzbek, hardcoded inline. Never write text that advises, warns, or judges —
no "dozani o'tkazib yubormang", no "sog'lig'ingiz uchun xavfli". You state facts about what
the user logged, nothing more. This is an explicit judging criterion.

## Files you own
`src/lib/schedule.js`, `src/components/DoseCard.jsx`, `src/pages/Today.jsx`

## Do not touch
Anything in `context/`, `App.jsx`, `index.css` (A) · `Week.jsx`, `WeekGrid.jsx`,
`Onboarding.jsx`, `Settings.jsx`, `MedForm.jsx` (C)

## Handoff
C imports `calcStreak` and `weekSummary` from your file — get the signatures into the group chat
by 11:00 even if the bodies are unfinished, so C can build against them.

## Done when
- [ ] A dose can be marked taken and survives a page refresh
- [ ] Marking the same dose twice does not create a duplicate row
- [ ] Overdue doses look visually different from upcoming ones
- [ ] A med with two daily times renders two separate cards
- [ ] Works at 375px width