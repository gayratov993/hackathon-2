import { createContext, useContext, useEffect, useState } from 'react'
import { LANGUAGES, translations } from '../lib/translations'

const STORAGE_KEY = 'medtime-lang'
const DEFAULT = 'uz'

const LanguageContext = createContext(null)

function readInitialLang() {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored && translations[stored]) return stored

  const browser = navigator.language?.slice(0, 2).toLowerCase()
  return translations[browser] ? browser : DEFAULT
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(readInitialLang)

  useEffect(() => {
    document.documentElement.setAttribute('lang', lang)
    localStorage.setItem(STORAGE_KEY, lang)
  }, [lang])

  // Missing keys fall back to Uzbek rather than rendering the raw key.
  function t(key, ...args) {
    const value = translations[lang]?.[key] ?? translations[DEFAULT][key]
    if (value === undefined) return key
    return typeof value === 'function' ? value(...args) : value
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, languages: LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('useLanguage must be used inside LanguageProvider')
  return context
}
