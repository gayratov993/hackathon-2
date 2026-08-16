import { motion } from 'motion/react'
import { useTheme } from '../context/ThemeContext'

export function ThemeToggle({ className = '' }) {
  const { isDark, toggle } = useTheme()

  return (
    <motion.button
      type="button"
      onClick={toggle}
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.06 }}
      className={`btn btn-ghost btn-circle btn-sm text-base-content/70 hover:text-base-content ${className}`}
      aria-label={isDark ? 'Yorug‘ rejimga o‘tish' : 'Tungi rejimga o‘tish'}
      title={isDark ? 'Yorug‘ rejim' : 'Tungi rejim'}
    >
      <motion.svg
        key={isDark ? 'moon' : 'sun'}
        initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        {isDark ? (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        ) : (
          <>
            <circle cx="12" cy="12" r="4" />
            <path
              strokeLinecap="round"
              d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
            />
          </>
        )}
      </motion.svg>
    </motion.button>
  )
}
