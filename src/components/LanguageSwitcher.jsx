import { motion } from 'motion/react'
import { useLanguage } from '../context/LanguageContext'

export function LanguageSwitcher({ className = '' }) {
  const { lang, setLang, languages } = useLanguage()

  return (
    <div
      className={`inline-flex items-center gap-0.5 rounded-full bg-base-200/80 p-0.5 ${className}`}
      role="group"
      aria-label="Til / Язык / Language"
    >
      {languages.map((item) => {
        const active = item.code === lang
        return (
          <motion.button
            key={item.code}
            type="button"
            onClick={() => setLang(item.code)}
            whileTap={{ scale: 0.92 }}
            className={`relative rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
              active ? 'text-primary-content' : 'text-base-content/60 hover:text-base-content'
            }`}
            aria-pressed={active}
            title={item.label}
          >
            {active && (
              <motion.span
                layoutId="lang-pill"
                className="absolute inset-0 rounded-full bg-primary"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative z-10">{item.short}</span>
          </motion.button>
        )
      })}
    </div>
  )
}
