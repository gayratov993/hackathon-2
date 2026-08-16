# C — Onboarding, Week & Settings

**Branch:** `feat/c-screens`
**You own the day-1 and day-7 story.** Onboarding is the jury's first impression; the Week grid
is the proof that this is a habit app and not a form. Both get demoed on camera.

---

## Timeline

### 10:00–10:45 — `components/MedForm.jsx` (start before A finishes)

Presentational. Props: `{ initial, onSubmit, submitting }`. No Supabase in here.

Fields:
- **Nomi** — text. Placeholder `masalan: ertalabki dori` — deliberately *not* a real drug name.
  Below it, small muted text: `Istagan nom bering. Biz kasallik nomini so'ramaymiz.`
  That line is a scoring point, not decoration.
- **Miqdori** — text, optional. `1 tabletka`
- **Vaqtlari** — one or more `<input type="time">`, with a **+ vaqt qo'shish** button and a
  remove button per row. Minimum one.

Validation: name required, at least one time, no duplicate times. Inline errors, no `alert()`.

### 10:45–11:30 — `components/EmptyState.jsx` + `components/Nav.jsx`

- `EmptyState`: props `{ title, body, actionLabel, onAction }`. Used by Today, Week and Settings.
- `Nav`: bottom tab bar (Bugun / Hafta / Sozlamalar), daisyUI `btm-nav`, active route highlighted.
  Mobile-first, `max-w-md mx-auto`.

### 11:30–12:00 — `pages/Onboarding.jsx`

- Shown once, when the user has zero meds. One screen, no multi-step wizard.
- Heading: `Bitta doridan boshlaymiz.` Then `MedForm`, then insert into `meds` and navigate to `/`.
- Do not ask for anything you don't insert. No age, no weight, no condition, no phone number.

### 12:00–12:45 — `pages/Week.jsx` + `components/WeekGrid.jsx`

This is the screenshot that ends up in the README.

- `WeekGrid` props: `{ days }` from B's `weekSummary`. Seven columns (Du…Ya), one row per med
  or one row total — pick whichever renders cleanly at 375px and stop there.
- Cell states: full (taken), hollow (skipped), empty (no log), faint (before the med existed).
  Legend underneath, four small items.
- Above the grid: streak badge from `calcStreak`, and one factual line:
  `Bu hafta 18 dozadan 16 tasini belgiladingiz.` No advice, no praise, no warning.
- Day-1 empty state: `Birinchi kuningiz. Ertaga bu yer to'la boshlaydi.`

### 12:45–13:00 — `pages/Settings.jsx`

- List of meds with an edit (reuse `MedForm`) and a **deactivate** action — set `active = false`,
  never hard-delete, so history stays intact.
- **`Barcha ma'lumotlarimni o'chirish`** — `btn-error`, daisyUI `modal` confirmation, deletes the
  user's `med_logs` then `meds`. Build this even if you cut something else; it is a direct answer
  to the "health data is sensitive" criterion and D will point at it in the video.
- Short static text: what we store and what we don't. Copy it from CLAUDE.md §4.

---

## Files you own
`src/pages/Onboarding.jsx`, `src/pages/Week.jsx`, `src/pages/Settings.jsx`,
`src/components/MedForm.jsx`, `src/components/WeekGrid.jsx`, `src/components/EmptyState.jsx`,
`src/components/Nav.jsx`

## Do not touch
`Today.jsx`, `DoseCard.jsx`, `lib/schedule.js` (B) · `App.jsx`, `context/`, `index.css` (A)

## Dependencies
You import `calcStreak` and `weekSummary` from B's `lib/schedule.js`. Get the signatures from B
at 11:00 and build against a hardcoded fixture until the real ones land — do not sit and wait.

## Done when
- [ ] A brand-new account can add a med and reach Today without touching the Supabase dashboard
- [ ] Week grid renders correctly with zero logs, partial logs, and a full week
- [ ] Delete-my-data actually empties both tables and returns the user to onboarding
- [ ] Bottom nav works on all three screens at 375px