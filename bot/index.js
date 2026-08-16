// MedTime Telegram reminder bot. Standalone process — never bundled into
// the Vite app. Deploy as its own Railway service (or run anywhere long-lived).
//
// Required env vars:
//   TELEGRAM_BOT_TOKEN        from @BotFather
//   SUPABASE_URL              same project as the app
//   SUPABASE_SERVICE_ROLE_KEY service_role key — only ever lives here, never
//                             in the Vite app or committed to the repo
//
// What it does:
//   1. Long-polls Telegram for messages. On "/start <code>", links that chat
//      to the profile whose telegram_link_code matches (set from Settings).
//   2. Every minute, finds doses scheduled in the last minute with no
//      med_logs row yet, and sends a one-line reminder to each linked user.
//      A dose is never nagged twice per run — see `notified` below.
//
// Not built: retry/backoff on Telegram API errors, persistence of `notified`
// across restarts (a `notified_at` column on med_logs would be the proper
// fix), and delivery confirmation. Good enough for a demo, not for production.

import { createClient } from '@supabase/supabase-js'

const { TELEGRAM_BOT_TOKEN, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env

for (const [name, value] of Object.entries({
  TELEGRAM_BOT_TOKEN,
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
})) {
  if (!value) {
    console.error(`Missing required env var: ${name}`)
    process.exit(1)
  }
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`

async function callTelegram(method, body) {
  const res = await fetch(`${TELEGRAM_API}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const json = await res.json()
  if (!json.ok) {
    console.error(`Telegram API error (${method}):`, json.description)
  }
  return json
}

function sendMessage(chatId, text) {
  return callTelegram('sendMessage', { chat_id: chatId, text })
}

async function handleStart(chatId, code) {
  if (!code) {
    await sendMessage(
      chatId,
      "Salom! MedTime ilovasidagi Sozlamalar bo'limidan ulanish kodini oling va /start <kod> deb yozing.",
    )
    return
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({ telegram_chat_id: chatId })
    .eq('telegram_link_code', code)
    .select('id')
    .maybeSingle()

  if (error || !data) {
    await sendMessage(chatId, "Kod topilmadi yoki eskirgan. Sozlamalardan yangi kod oling.")
    return
  }

  await sendMessage(chatId, "Ulandi. Endi dorilaringiz vaqti kelganda shu yerga eslatma yuboriladi.")
}

let updateOffset = 0

async function pollUpdates() {
  const res = await callTelegram('getUpdates', { offset: updateOffset, timeout: 20 })
  for (const update of res.result ?? []) {
    updateOffset = update.update_id + 1
    const text = update.message?.text
    const chatId = update.message?.chat?.id
    if (!text || !chatId) continue

    if (text.startsWith('/start')) {
      const code = text.split(' ')[1]?.trim()
      await handleStart(chatId, code)
    }
  }
}

const notified = new Set()

async function checkDueDoses() {
  const now = new Date()
  const windowStart = new Date(now.getTime() - 60_000)

  // meds.user_id and profiles.id both reference auth.users, but there's no
  // FK between meds and profiles directly, so PostgREST can't embed one from
  // the other — join them in JS instead.
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, telegram_chat_id')
    .not('telegram_chat_id', 'is', null)

  if (profilesError) {
    console.error('Failed to load profiles:', profilesError.message)
    return
  }

  const chatIdByUser = new Map(profiles.map((p) => [p.id, p.telegram_chat_id]))
  if (chatIdByUser.size === 0) return

  const { data: meds, error: medsError } = await supabase
    .from('meds')
    .select('id, user_id, name, dose_text, times, active')
    .eq('active', true)
    .in('user_id', [...chatIdByUser.keys()])

  if (medsError) {
    console.error('Failed to load meds:', medsError.message)
    return
  }

  for (const med of meds ?? []) {
    const chatId = chatIdByUser.get(med.user_id)
    if (!chatId) continue

    for (const timeStr of med.times ?? []) {
      const [hours, minutes] = timeStr.split(':').map(Number)
      const scheduled = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0)
      if (scheduled < windowStart || scheduled > now) continue

      const key = `${med.id}-${scheduled.toISOString()}`
      if (notified.has(key)) continue

      const { data: existingLog } = await supabase
        .from('med_logs')
        .select('id')
        .eq('med_id', med.id)
        .eq('scheduled_for', scheduled.toISOString())
        .maybeSingle()

      if (existingLog) continue

      const dose = med.dose_text ? `${med.name} (${med.dose_text})` : med.name
      await sendMessage(chatId, `Eslatma: ${dose} — ${timeStr}.`)
      notified.add(key)
    }
  }
}

console.log('MedTime bot started.')

async function loop() {
  try {
    await pollUpdates()
  } catch (err) {
    console.error('pollUpdates failed:', err.message)
  }
  setTimeout(loop, 1000)
}

setInterval(() => {
  checkDueDoses().catch((err) => console.error('checkDueDoses failed:', err.message))
}, 60_000)

loop()
