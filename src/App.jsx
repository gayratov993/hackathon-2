import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { LanguageProvider } from './context/LanguageContext'
import { supabase } from './lib/supabase'
import { Landing } from './pages/Landing'
import { Login } from './pages/Login'
import { Onboarding } from './pages/Onboarding'
import { Today } from './pages/Today'
import { Week } from './pages/Week'
import { Settings } from './pages/Settings'
import { Pharmacies } from './pages/Pharmacies'

function PageSkeleton() {
  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <div className="skeleton h-8 w-40 mb-4" />
      <div className="skeleton h-24 w-full mb-3" />
      <div className="skeleton h-24 w-full" />
    </div>
  )
}

// Routes fade/slide as a unit. Motion needs a stable wrapper per route so
// AnimatePresence can run the exit animation before the next page mounts.
function Page({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}

function RequireAuth({ children }) {
  const { session, loading } = useAuth()

  if (loading) return <PageSkeleton />
  if (!session) return <Navigate to="/login" replace />

  return children
}

function RequireMeds({ children }) {
  const { user } = useAuth()
  const [hasMeds, setHasMeds] = useState(null)

  useEffect(() => {
    if (!user) return
    supabase
      .from('meds')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .then(({ count }) => setHasMeds((count ?? 0) > 0))
  }, [user])

  if (hasMeds === null) return <PageSkeleton />
  if (!hasMeds) return <Navigate to="/onboarding" replace />

  return children
}

// Public marketing page for signed-out visitors (and crawlers); signed-in
// users see the app exactly as before. Keeps "/" crawlable for SEO/GEO/AEO
// without gating it behind RequireAuth's redirect-to-/login.
function HomeRoute() {
  const { session, loading } = useAuth()

  if (loading) return <PageSkeleton />
  if (!session) return <Landing />

  return (
    <RequireMeds>
      <Today />
    </RequireMeds>
  )
}

function AppRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route
          path="/login"
          element={
            <Page>
              <Login />
            </Page>
          }
        />
        <Route
          path="/onboarding"
          element={
            <RequireAuth>
              <Page>
                <Onboarding />
              </Page>
            </RequireAuth>
          }
        />
        <Route
          path="/"
          element={
            <Page>
              <HomeRoute />
            </Page>
          }
        />
        <Route
          path="/week"
          element={
            <RequireAuth>
              <Page>
                <Week />
              </Page>
            </RequireAuth>
          }
        />
        <Route
          path="/pharmacies"
          element={
            <RequireAuth>
              <Page>
                <Pharmacies />
              </Page>
            </RequireAuth>
          }
        />
        <Route
          path="/settings"
          element={
            <RequireAuth>
              <Page>
                <Settings />
              </Page>
            </RequireAuth>
          }
        />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}
