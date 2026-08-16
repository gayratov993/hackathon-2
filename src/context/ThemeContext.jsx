import { createContext, useContext, useEffect, useState } from 'react'

const STORAGE_KEY = 'medtime-theme'
const LIGHT = 'emerald'
const DARK = 'forest'

const ThemeContext = createContext(null)

function readInitialTheme() {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === LIGHT || stored === DARK) return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? DARK : LIGHT
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(readInitialTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  // Follow the OS only while the user has not made an explicit choice.
  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (e) => setTheme(e.matches ? DARK : LIGHT)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  const toggle = () => setTheme((current) => (current === DARK ? LIGHT : DARK))

  return (
    <ThemeContext.Provider value={{ theme, isDark: theme === DARK, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used inside ThemeProvider')
  return context
}
