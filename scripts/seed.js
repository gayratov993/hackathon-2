import { createClient } from '@supabase/supabase-js'

/**
 * Demo Account Seeding Script for Dori Vaqti
 * 
 * Usage:
 *   node scripts/seed.js <email> <password>
 *   Or with environment variables:
 *   VITE_SUPABASE_URL=... VITE_SUPABASE_ANON_KEY=... node scripts/seed.js <email> <password>
 */

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'placeholder'

const email = process.argv[2] || process.env.DEMO_EMAIL
const password = process.argv[3] || process.env.DEMO_PASSWORD

if (!email || !password) {
  console.error('Xatolik: Demo hisob email va parolini kiriting!')
  console.error('Foydalanish: node scripts/seed.js <email> <password>')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function seed() {
  console.log(`\n🌱 '${email}' hisobi uchun demo ma'lumotlarni kiritish boshlandi...`)

  // 1. Sign in as demo user
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (authError || !authData.user) {
    console.error("❌ Tizimga kirishda xatolik:", authError?.message)
    process.exit(1)
  }

  const userId = authData.user.id
  console.log(`✅ Foydalanuvchi tasdiqlandi (ID: ${userId})`)

  // 2. Clear existing meds and logs for a clean idempotent seed
  console.log("🧹 Eski test ma'lumotlari tozalanmoqda...")
  await supabase.from('med_logs').delete().eq('user_id', userId)
  await supabase.from('meds').delete().eq('user_id', userId)

  const now = new Date()
  // Creation date: 7 days ago
  const sevenDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7, 8, 0, 0)

  // 3. Insert 2 medicines:
  // Med 1: Once-daily (Vitamin D - 13:00)
  // Med 2: Twice-daily (Ertalabki dori - 08:00, 20:00)
  console.log("💊 2 ta dori qo'shilmoqda (biri kuniga 1 mahal, ikkinchisi 2 mahal)...")
  const { data: meds, error: medsError } = await supabase
    .from('meds')
    .insert([
      {
        user_id: userId,
        name: 'Ertalabki dori',
        dose_text: '1 tabletka',
        times: ['08:00', '20:00'],
        active: true,
        created_at: sevenDaysAgo.toISOString(),
      },
      {
        user_id: userId,
        name: 'Vitamin D',
        dose_text: '2 tomchi',
        times: ['13:00'],
        active: true,
        created_at: sevenDaysAgo.toISOString(),
      },
    ])
    .select()

  if (medsError || !meds) {
    console.error("❌ Dorilarni qo'shishda xatolik:", medsError?.message)
    process.exit(1)
  }

  const twiceMed = meds.find((m) => m.times.length === 2)
  const onceMed = meds.find((m) => m.times.length === 1)

  console.log(`✅ Dorilar yaratildi: "${twiceMed.name}", "${onceMed.name}"`)

  // 4. Generate 6 days of backdated logs (Day -6 to Day -1) with 2 deliberate gaps:
  // - Gap 1: 3 days ago at 20:00 -> skipped (marked 'skipped')
  // - Gap 2: 5 days ago at 13:00 -> missed completely (no log row)
  console.log("📅 6 kunlik tarixiy jurnallar (med_logs) yaratilmoqda...")

  const logsToInsert = []

  for (let dayOffset = 6; dayOffset >= 1; dayOffset--) {
    const targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOffset)

    // Twice daily: 08:00
    const time08 = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 8, 0, 0)
    logsToInsert.push({
      user_id: userId,
      med_id: twiceMed.id,
      scheduled_for: time08.toISOString(),
      status: 'taken',
      logged_at: new Date(time08.getTime() + 5 * 60 * 1000).toISOString(),
    })

    // Twice daily: 20:00
    const time20 = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 20, 0, 0)
    // Gap 1: Day offset 3 at 20:00 was skipped
    if (dayOffset === 3) {
      logsToInsert.push({
        user_id: userId,
        med_id: twiceMed.id,
        scheduled_for: time20.toISOString(),
        status: 'skipped',
        logged_at: new Date(time20.getTime() + 10 * 60 * 1000).toISOString(),
      })
    } else {
      logsToInsert.push({
        user_id: userId,
        med_id: twiceMed.id,
        scheduled_for: time20.toISOString(),
        status: 'taken',
        logged_at: new Date(time20.getTime() + 4 * 60 * 1000).toISOString(),
      })
    }

    // Once daily: 13:00
    // Gap 2: Day offset 5 at 13:00 was completely missed (no log)
    if (dayOffset !== 5) {
      const time13 = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 13, 0, 0)
      logsToInsert.push({
        user_id: userId,
        med_id: onceMed.id,
        scheduled_for: time13.toISOString(),
        status: 'taken',
        logged_at: new Date(time13.getTime() + 2 * 60 * 1000).toISOString(),
      })
    }
  }

  // Today's morning dose (08:00) taken, others pending
  const today08 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0, 0)
  logsToInsert.push({
    user_id: userId,
    med_id: twiceMed.id,
    scheduled_for: today08.toISOString(),
    status: 'taken',
    logged_at: new Date(today08.getTime() + 3 * 60 * 1000).toISOString(),
  })

  const { error: logsError } = await supabase
    .from('med_logs')
    .upsert(logsToInsert, { onConflict: 'med_id,scheduled_for' })

  if (logsError) {
    console.error("❌ Jurnallarni kiritishda xatolik:", logsError.message)
    process.exit(1)
  }

  console.log(`✅ Jami ${logsToInsert.length} ta doza jurnali muvaffaqiyatli kiritildi!`)
  console.log(`✨ Demo hisob 7-kunlik ko'rinish va videoga olish uchun to'liq tayyor! 🎉\n`)
}

seed()
