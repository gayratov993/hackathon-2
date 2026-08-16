import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { ThemeToggle } from '../components/ThemeToggle'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { validateEmail, validatePassword, translateAuthError } from '../lib/validation'

const STRENGTH_STYLES = [
  { width: '0%', bar: 'bg-base-300', key: null },
  { width: '25%', bar: 'bg-error', key: 'auth.strength.weak' },
  { width: '50%', bar: 'bg-warning', key: 'auth.strength.fair' },
  { width: '75%', bar: 'bg-info', key: 'auth.strength.good' },
  { width: '100%', bar: 'bg-success', key: 'auth.strength.strong' },
]

export function Login() {
  const { signIn, signUp } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()

  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [touched, setTouched] = useState({ email: false, password: false })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(null)

  const isSignup = mode === 'signup'

  const emailCheck = useMemo(() => validateEmail(email), [email])
  const passwordCheck = useMemo(() => validatePassword(password), [password])

  // Sign-in must not re-apply the sign-up rules: an existing account may predate
  // them, and telling someone their own password is "too weak" at the door is wrong.
  const canSubmit = isSignup
    ? emailCheck.valid && passwordCheck.valid
    : email.trim().length > 0 && password.length > 0

  const showEmailError = touched.email && email.length > 0 && !emailCheck.valid
  const showPasswordRules = isSignup && (touched.password || password.length > 0)

  function switchMode(next) {
    setMode(next)
    setError(null)
    setTouched({ email: false, password: false })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setTouched({ email: true, password: true })

    if (isSignup) {
      if (!emailCheck.valid) {
        setError(emailCheck.error)
        return
      }
      if (!passwordCheck.valid) {
        setError(passwordCheck.error ?? t('auth.passwordPlaceholder'))
        return
      }
    }

    setSubmitting(true)
    setError(null)

    const result = isSignup
      ? await signUp(email.trim(), password)
      : await signIn(email.trim(), password)

    setSubmitting(false)

    if (result.error) {
      setError(translateAuthError(result.error.message))
      return
    }

    // With email confirmation enabled Supabase returns no session, so there is
    // nothing to navigate to yet — hold on the "check your inbox" screen.
    if (isSignup && result.needsConfirmation) {
      setAwaitingConfirmation(email.trim())
      return
    }

    navigate('/', { replace: true })
  }

  const strength = STRENGTH_STYLES[passwordCheck.score] ?? STRENGTH_STYLES[0]

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center px-4 py-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -left-32 h-96 w-96 rounded-full bg-primary/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -right-24 h-96 w-96 rounded-full bg-success/10 blur-3xl"
      />

      <div className="absolute top-4 right-4 flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>

      <div className="relative w-full max-w-sm">
        <AnimatePresence mode="wait">
          {awaitingConfirmation ? (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="card bg-base-100 border border-base-200 shadow-lg"
            >
              <div className="card-body items-center text-center gap-3 p-8">
                <motion.div
                  initial={{ scale: 0.5, rotate: -12 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                  className="flex h-16 w-16 items-center justify-center rounded-2xl bg-success/15 text-success"
                  aria-hidden="true"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.75"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 8l9 6 9-6M4 6h16a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V7a1 1 0 011-1z"
                    />
                  </svg>
                </motion.div>
                <h1 className="text-xl font-bold">{t('auth.confirmTitle')}</h1>
                <p className="text-sm text-base-content/70">
                  {t('auth.confirmBody', awaitingConfirmation)}
                </p>
                <p className="text-xs text-base-content/50">{t('auth.confirmNote')}</p>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm mt-2"
                  onClick={() => {
                    setAwaitingConfirmation(null)
                    switchMode('signin')
                  }}
                >
                  {t('auth.backToSignin')}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex flex-col items-center text-center mb-7">
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                  className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-7 w-7"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 2" />
                    <circle cx="12" cy="13" r="8" strokeLinecap="round" strokeLinejoin="round" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 3h6M12 3v2" />
                  </svg>
                </motion.div>
                <h1 className="text-2xl font-bold tracking-tight">{t('auth.brand')}</h1>
                <p className="text-sm text-base-content/60 mt-1">{t('auth.tagline')}</p>
              </div>

              {/* Mode switch */}
              <div className="relative mb-5 grid grid-cols-2 gap-1 rounded-xl bg-base-200/80 p-1">
                {[
                  ['signin', t('auth.signinTab')],
                  ['signup', t('auth.signupTab')],
                ].map(([value, label]) => (
                  <motion.button
                    key={value}
                    type="button"
                    onClick={() => switchMode(value)}
                    whileTap={{ scale: 0.97 }}
                    className={`relative rounded-lg py-2 text-sm font-semibold transition-colors ${
                      mode === value
                        ? 'text-primary-content'
                        : 'text-base-content/60 hover:text-base-content'
                    }`}
                    aria-pressed={mode === value}
                  >
                    {mode === value && (
                      <motion.span
                        layoutId="auth-tab"
                        className="absolute inset-0 rounded-lg bg-primary shadow-sm"
                        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                      />
                    )}
                    <span className="relative z-10">{label}</span>
                  </motion.button>
                ))}
              </div>

              <form
                onSubmit={handleSubmit}
                noValidate
                className="card bg-base-100 border border-base-200 shadow-lg"
              >
                <div className="card-body gap-3 p-6">
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        role="alert"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="alert alert-error text-sm py-2 overflow-hidden"
                      >
                        <span>{error}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Email */}
                  <label className="flex flex-col gap-1" htmlFor="email">
                    <span className="text-sm font-medium text-base-content/80">
                      {t('auth.email')}
                    </span>
                    <input
                      id="email"
                      type="email"
                      required
                      autoComplete="email"
                      inputMode="email"
                      placeholder={t('auth.emailPlaceholder')}
                      className={`input input-bordered w-full transition-all duration-200 focus:shadow-sm ${
                        showEmailError ? 'input-error' : 'focus:border-primary'
                      }`}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => setTouched((s) => ({ ...s, email: true }))}
                      disabled={submitting}
                      aria-invalid={showEmailError}
                    />
                    <AnimatePresence>
                      {showEmailError && (
                        <motion.span
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="text-xs text-error"
                        >
                          {emailCheck.error}
                          {emailCheck.suggestion && (
                            <button
                              type="button"
                              className="ml-1 underline font-medium"
                              onClick={() => setEmail(emailCheck.suggestion)}
                            >
                              {emailCheck.suggestion}
                            </button>
                          )}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </label>

                  {/* Password */}
                  <label className="flex flex-col gap-1" htmlFor="password">
                    <span className="text-sm font-medium text-base-content/80">
                      {t('auth.password')}
                    </span>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        autoComplete={isSignup ? 'new-password' : 'current-password'}
                        placeholder={isSignup ? t('auth.passwordPlaceholder') : undefined}
                        className="input input-bordered w-full pr-11 transition-all duration-200 focus:border-primary focus:shadow-sm"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onBlur={() => setTouched((s) => ({ ...s, password: true }))}
                        disabled={submitting}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-base-content/50 hover:text-base-content"
                        aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                        tabIndex={-1}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          aria-hidden="true"
                        >
                          {showPassword ? (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.4 5.2A9.5 9.5 0 0112 5c5 0 9 4.5 9 7a11 11 0 01-2.6 3.5M6.2 6.6A11.6 11.6 0 003 12c0 2.5 4 7 9 7a9.6 9.6 0 003.6-.7"
                            />
                          ) : (
                            <>
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3 12s3.5-7 9-7 9 7 9 7-3.5 7-9 7-9-7-9-7z"
                              />
                              <circle cx="12" cy="12" r="2.5" />
                            </>
                          )}
                        </svg>
                      </button>
                    </div>

                    {/* Strength meter + rule checklist, sign-up only */}
                    <AnimatePresence>
                      {showPasswordRules && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden pt-1"
                        >
                          <div className="h-1.5 w-full rounded-full bg-base-300 overflow-hidden">
                            <motion.div
                              className={`h-full rounded-full ${strength.bar}`}
                              animate={{ width: strength.width }}
                              transition={{ duration: 0.3, ease: 'easeOut' }}
                            />
                          </div>
                          {strength.key && (
                            <p className="mt-1 text-xs text-base-content/60">
                              {t('auth.strength')}: {t(strength.key)}
                            </p>
                          )}
                          <ul className="mt-2 space-y-1">
                            {passwordCheck.checks.map((check) => (
                              <li
                                key={check.id}
                                className={`flex items-center gap-1.5 text-xs transition-colors ${
                                  check.passed ? 'text-success' : 'text-base-content/50'
                                }`}
                              >
                                <motion.span
                                  animate={{ scale: check.passed ? [1, 1.3, 1] : 1 }}
                                  transition={{ duration: 0.25 }}
                                  aria-hidden="true"
                                >
                                  {check.passed ? '✓' : '○'}
                                </motion.span>
                                {check.label}
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </label>

                  <motion.button
                    type="submit"
                    whileTap={canSubmit && !submitting ? { scale: 0.98 } : undefined}
                    className="btn btn-primary mt-3 min-h-[44px] hover:brightness-105 hover:shadow-md"
                    disabled={submitting || !canSubmit}
                  >
                    {submitting ? (
                      <span className="loading loading-spinner loading-sm" />
                    ) : isSignup ? (
                      t('auth.signup')
                    ) : (
                      t('auth.signin')
                    )}
                  </motion.button>

                  <p className="text-center text-xs text-base-content/50 mt-1">
                    {t('auth.terms')}
                  </p>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
