// Pure validation helpers for the auth screens. No React, no Supabase imports.
// These reduce obviously-bad signups at the client; the real gate is Supabase's
// email confirmation, which must stay ON in the dashboard.

// Deliberately stricter than the HTML5 email type: requires a dotted TLD of at
// least two letters and rejects consecutive/edge dots in the local part.
const EMAIL_RE = /^[a-z0-9]+(?:[._%+-][a-z0-9]+)*@[a-z0-9]+(?:-[a-z0-9]+)*(?:\.[a-z0-9]+(?:-[a-z0-9]+)*)*\.[a-z]{2,}$/i

// Throwaway inbox providers — an address here can be created by anyone in
// seconds, so a confirmation link proves nothing about the person.
const DISPOSABLE_DOMAINS = new Set([
  '10minutemail.com',
  'guerrillamail.com',
  'mailinator.com',
  'tempmail.com',
  'temp-mail.org',
  'throwawaymail.com',
  'yopmail.com',
  'sharklasers.com',
  'getnada.com',
  'trashmail.com',
  'fakeinbox.com',
  'maildrop.cc',
  'dispostable.com',
  'mintemail.com',
  'tempail.com',
])

// Near-misses for the providers our users actually type.
const DOMAIN_TYPOS = {
  'gmail.co': 'gmail.com',
  'gmail.cm': 'gmail.com',
  'gmail.con': 'gmail.com',
  'gmial.com': 'gmail.com',
  'gmai.com': 'gmail.com',
  'gmaill.com': 'gmail.com',
  'gnail.com': 'gmail.com',
  'gmail.ru': 'gmail.com',
  'mail.ri': 'mail.ru',
  'yahoo.co': 'yahoo.com',
  'yaho.com': 'yahoo.com',
  'hotmial.com': 'hotmail.com',
  'outlok.com': 'outlook.com',
}

export function domainOf(email) {
  const at = String(email).lastIndexOf('@')
  return at === -1 ? '' : String(email).slice(at + 1).toLowerCase().trim()
}

/**
 * @returns {{ valid: boolean, error: string|null, suggestion: string|null }}
 */
export function validateEmail(rawEmail) {
  const email = String(rawEmail ?? '').trim()

  if (!email) {
    return { valid: false, error: 'Email kiriting.', suggestion: null }
  }
  if (email.length > 254) {
    return { valid: false, error: 'Email juda uzun.', suggestion: null }
  }
  if (!EMAIL_RE.test(email)) {
    return { valid: false, error: "Email formati noto'g'ri. Masalan: ism@gmail.com", suggestion: null }
  }

  const domain = domainOf(email)

  if (DISPOSABLE_DOMAINS.has(domain)) {
    return {
      valid: false,
      error: "Vaqtinchalik pochta manzillari qabul qilinmaydi. Doimiy emailingizni kiriting.",
      suggestion: null,
    }
  }

  if (DOMAIN_TYPOS[domain]) {
    const local = email.slice(0, email.lastIndexOf('@'))
    return {
      valid: false,
      error: 'Email manzilida xatolik bormi?',
      suggestion: `${local}@${DOMAIN_TYPOS[domain]}`,
    }
  }

  return { valid: true, error: null, suggestion: null }
}

const PASSWORD_RULES = [
  { id: 'length', label: 'Kamida 8 ta belgi', test: (p) => p.length >= 8 },
  { id: 'letter', label: 'Kamida bitta harf', test: (p) => /[a-z]/i.test(p) },
  { id: 'number', label: 'Kamida bitta raqam', test: (p) => /\d/.test(p) },
]

// Passwords so common that a confirmed email still leaves the account trivial to take.
const WEAK_PASSWORDS = new Set([
  'password', '12345678', '123456789', '1234567890', 'qwerty123',
  'password1', 'parol123', '11111111', 'abc12345', 'iloveyou',
])

/**
 * @returns {{ valid: boolean, error: string|null, checks: Array, score: number }}
 */
export function validatePassword(rawPassword) {
  const password = String(rawPassword ?? '')
  const checks = PASSWORD_RULES.map((rule) => ({
    id: rule.id,
    label: rule.label,
    passed: rule.test(password),
  }))

  const passedCount = checks.filter((c) => c.passed).length

  if (!password) {
    return { valid: false, error: 'Parol kiriting.', checks, score: 0 }
  }
  if (WEAK_PASSWORDS.has(password.toLowerCase())) {
    return {
      valid: false,
      error: "Bu parol juda ko'p ishlatiladi. Boshqasini tanlang.",
      checks,
      score: 1,
    }
  }

  const failed = checks.find((c) => !c.passed)
  if (failed) {
    return { valid: false, error: null, checks, score: passedCount }
  }

  // All rules met — score 4 rewards extra length, purely for the meter.
  return { valid: true, error: null, checks, score: password.length >= 12 ? 4 : 3 }
}

// Supabase returns English strings; surface Uzbek for the cases users actually hit.
const AUTH_ERROR_MESSAGES = {
  'invalid login credentials': "Email yoki parol noto'g'ri.",
  'email not confirmed': 'Email hali tasdiqlanmagan. Pochtangizdagi havolani bosing.',
  'user already registered': "Bu email allaqachon ro'yxatdan o'tgan. Kiring.",
  'password should be at least 6 characters': "Parol kamida 6 ta belgidan iborat bo'lsin.",
  'email rate limit exceeded': "Juda ko'p urinish. Bir necha daqiqadan so'ng qayta urinib ko'ring.",
  'for security purposes, you can only request this after': "Juda tez urinyapsiz. Biroz kuting.",
  'signup requires a valid password': 'Parol kiritilmadi.',
  'unable to validate email address': "Email manzil noto'g'ri.",
}

export function translateAuthError(message) {
  const normalized = String(message ?? '').toLowerCase()
  for (const [key, uzbek] of Object.entries(AUTH_ERROR_MESSAGES)) {
    if (normalized.includes(key)) return uzbek
  }
  return message || "Xatolik yuz berdi. Qaytadan urinib ko'ring."
}
