// Seeds a demo account with 6 backdated days of med_logs so the Week screen has a
// realistic filled grid for the video. Two deliberate gaps (one skipped, one missing
// entirely) so the grid doesn't look fake.
//
// Usage:
//   DEMO_EMAIL=... DEMO_PASSWORD=... VITE_SUPABASE_URL=... VITE_SUPABASE_ANON_KEY=... node scripts/seed.js
//
// Credentials are never hardcoded here or committed — pass them as env vars, and share
// the demo account's email/password in the team chat, not in the repo (CLAUDE.md §3/§8).
//
// Safe to run more than once: meds are matched by name (not re-inserted), and med_logs
// are upserted on the (med_id, scheduled_for) unique constraint.

import { createClient } from '@supabase/supabase-js'

const { VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, DEMO_EMAIL, DEMO_PASSWORD } = process.env

for (const [name, value] of Object.entries({
  VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY,
  DEMO_EMAIL,
  DEMO_PASSWORD,
})) {
  if (!value) {
    console.error(`Missing required env var: ${name}`)
    process.exit(1)
  }
}

const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)

const MEDS = [
  { name: '1-dori', dose_text: '1 tabletka', times: ['09:00'] },
  { name: '2-dori', dose_text: '1 tabletka', times: ['08:00', '20:00'] },
]

// One slot skipped, one slot missing entirely (never inserted). Indexes are into the
// flat 18-slot list built below (6 days * 3 doses/day), oldest day first.
const SKIPPED_SLOT_INDEX = 10
const MISSING_SLOT_INDEX = 4

function startOfLocalDay(date) {
  const d = new Date(date)
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0)
}

function scheduledDate(dayDate, timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number)
  return new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate(), hours, minutes, 0, 0)
}

async function signInOrSignUp() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
  })
  if (!error) return data

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
  })
  if (signUpError) {
    console.error('Could not sign in or sign up demo account:', signUpError.message)
    process.exit(1)
  }
  return signUpData
}

async function ensureMeds(userId) {
  // Backdated so weekSummary's "no expected doses before created_at" rule doesn't
  // discard the backdated days we're about to seed logs for.
  const backdatedCreatedAt = new Date()
  backdatedCreatedAt.setDate(backdatedCreatedAt.getDate() - 8)

  const { data: existing, error } = await supabase
    .from('meds')
    .select('id, name')
    .eq('user_id', userId)

  if (error) {
    console.error('Failed to read existing meds:', error.message)
    process.exit(1)
  }

  const byName = new Map(existing.map((m) => [m.name, m]))
  const meds = []

  for (const med of MEDS) {
    const found = byName.get(med.name)
    if (found) {
      const { error: updateError } = await supabase
        .from('meds')
        .update({ created_at: backdatedCreatedAt.toISOString() })
        .eq('id', found.id)
      if (updateError) {
        console.error(`Failed to backdate med "${med.name}":`, updateError.message)
        process.exit(1)
      }
      meds.push({ ...med, id: found.id })
      continue
    }
    const { data, error: insertError } = await supabase
      .from('meds')
      .insert({
        user_id: userId,
        name: med.name,
        dose_text: med.dose_text,
        times: med.times,
        created_at: backdatedCreatedAt.toISOString(),
      })
      .select()
      .single()
    if (insertError) {
      console.error(`Failed to insert med "${med.name}":`, insertError.message)
      process.exit(1)
    }
    meds.push({ ...med, id: data.id })
  }

  return meds
}

async function seedLogs(userId, meds) {
  const today = startOfLocalDay(new Date())

  // Flat list of the 6 backdated days' dose slots, oldest first.
  const slots = []
  for (let daysAgo = 6; daysAgo >= 1; daysAgo--) {
    const dayDate = new Date(today)
    dayDate.setDate(dayDate.getDate() - daysAgo)
    for (const med of meds) {
      for (const time of med.times) {
        slots.push({ med, at: scheduledDate(dayDate, time) })
      }
    }
  }

  let taken = 0
  let skipped = 0
  let missing = 0

  for (let i = 0; i < slots.length; i++) {
    const { med, at } = slots[i]

    if (i === MISSING_SLOT_INDEX) {
      missing++
      continue // deliberate gap: no row at all
    }

    const status = i === SKIPPED_SLOT_INDEX ? 'skipped' : 'taken'
    if (status === 'skipped') skipped++
    else taken++

    const { error } = await supabase.from('med_logs').upsert(
      {
        user_id: userId,
        med_id: med.id,
        scheduled_for: at.toISOString(),
        status,
        logged_at: at.toISOString(),
      },
      { onConflict: 'med_id,scheduled_for' },
    )
    if (error) {
      console.error('Failed to upsert log:', error.message)
      process.exit(1)
    }
  }

  console.log(`Seeded ${slots.length} slots: ${taken} taken, ${skipped} skipped, ${missing} missing.`)
}

const { user } = await signInOrSignUp()
const meds = await ensureMeds(user.id)
await seedLogs(user.id, meds)
console.log('Done. Demo account is ready for the week-7 story.')
