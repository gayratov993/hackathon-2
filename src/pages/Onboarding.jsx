import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { supabase } from '../lib/supabase'
import { MedForm } from '../components/MedForm'
import { ThemeToggle } from '../components/ThemeToggle'
import { LanguageSwitcher } from '../components/LanguageSwitcher'

const TOTAL_STEPS = 3

// Each step slides in from the direction of travel.
const variants = {
  enter: (dir) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
  center: { opacity: 1, x: 0 },
  exit: (dir) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
}

export function Onboarding() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()

  const [[step, direction], setStep] = useState([1, 1])
  const [displayName, setDisplayName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const go = (next) => setStep([next, next > step ? 1 : -1])

  async function saveName() {
    const trimmed = displayName.trim()
    if (!trimmed) {
      go(2)
      return
    }

    setSubmitting(true)
    setError(null)
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, display_name: trimmed }, { onConflict: 'id' })
    setSubmitting(false)

    if (error) {
      setError(error.message)
      return
    }
    go(2)
  }

  async function saveMed({ name, dose_text, times, notes }) {
    setSubmitting(true)
    setError(null)
    const { error } = await supabase.from('meds').insert({
      user_id: user.id,
      name,
      dose_text,
      times,
      notes,
    })
    setSubmitting(false)

    if (error) {
      setError(error.message)
      return
    }
    go(3)
  }

  return (
    <div className="relative min-h-dvh overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -left-32 h-96 w-96 rounded-full bg-primary/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -right-24 h-96 w-96 rounded-full bg-success/10 blur-3xl"
      />

      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>

      <div className="relative max-w-md mx-auto min-h-dvh flex flex-col justify-center px-6 py-16">
        {/* Progress */}
        <div className="mb-8">
          <p className="mb-2 text-xs font-medium text-base-content/50">
            {t('onboarding.step', step, TOTAL_STEPS)}
          </p>
          <div
            className="flex gap-1.5"
            role="progressbar"
            aria-valuenow={step}
            aria-valuemin={1}
            aria-valuemax={TOTAL_STEPS}
          >
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <div key={i} className="h-1.5 flex-1 overflow-hidden rounded-full bg-base-300">
                <motion.div
                  className="h-full rounded-full bg-primary"
                  initial={false}
                  animate={{ width: i < step ? '100%' : '0%' }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              role="alert"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="alert alert-error mb-4 text-sm overflow-hidden"
            >
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait" custom={direction}>
          {step === 1 && (
            <motion.div
              key="name"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="text-sm font-medium text-primary">{t('onboarding.welcome')}</p>
              <h1 className="mt-1 text-2xl font-bold">{t('onboarding.nameTitle')}</h1>
              <p className="mt-2 text-sm text-base-content/60">{t('onboarding.nameBody')}</p>

              <form
                className="mt-6"
                onSubmit={(e) => {
                  e.preventDefault()
                  saveName()
                }}
              >
                <input
                  type="text"
                  autoFocus
                  maxLength={60}
                  className="input input-bordered w-full transition-all duration-200 focus:border-primary"
                  placeholder={t('onboarding.namePlaceholder')}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={submitting}
                />
                <motion.button
                  type="submit"
                  whileTap={{ scale: 0.98 }}
                  className="btn btn-primary btn-block mt-4 min-h-[44px]"
                  disabled={submitting}
                >
                  {submitting ? (
                    <span className="loading loading-spinner loading-sm" />
                  ) : (
                    t('onboarding.next')
                  )}
                </motion.button>
                <button
                  type="button"
                  className="btn btn-ghost btn-block btn-sm mt-2 font-normal text-base-content/60"
                  onClick={() => go(2)}
                  disabled={submitting}
                >
                  {t('onboarding.skip')}
                </button>
              </form>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="med"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="text-2xl font-bold">{t('onboarding.medTitle')}</h1>
              <p className="mt-2 text-sm text-base-content/60">{t('onboarding.medBody')}</p>

              <div className="mt-6">
                <MedForm onSubmit={saveMed} submitting={submitting} />
              </div>

              <button
                type="button"
                className="btn btn-ghost btn-block btn-sm mt-2 font-normal text-base-content/60"
                onClick={() => go(1)}
                disabled={submitting}
              >
                {t('onboarding.back')}
              </button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="done"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0.4, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 240, damping: 14 }}
                className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-success/15 text-success"
                aria-hidden="true"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <motion.path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
                  />
                </svg>
              </motion.div>

              <h1 className="mt-5 text-2xl font-bold">
                {displayName.trim()
                  ? `${t('onboarding.doneTitle')} ${displayName.trim()}`
                  : t('onboarding.doneTitle')}
              </h1>
              <p className="mt-2 text-sm text-base-content/60">{t('onboarding.doneBody')}</p>

              <motion.button
                whileTap={{ scale: 0.98 }}
                className="btn btn-primary btn-block mt-6 min-h-[44px]"
                onClick={() => navigate('/', { replace: true })}
              >
                {t('onboarding.goHome')}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
