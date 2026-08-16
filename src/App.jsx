import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { supabase } from './lib/supabase'
import { Login } from './pages/Login'
import { Onboarding } from './pages/Onboarding'
import { Today } from './pages/Today'
import { Week } from './pages/Week'
import { Settings } from './pages/Settings'

function RequireAuth({ children }) {
  const { session, loading } = useAuth()

  if (loading) return <div className="skeleton h-32 w-full" />
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

  if (hasMeds === null) return <div className="skeleton h-32 w-full" />
  if (!hasMeds) return <Navigate to="/onboarding" replace />

  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/onboarding"
        element={
          <RequireAuth>
            <Onboarding />
          </RequireAuth>
        }
      />
      <Route
        path="/"
        element={
          <RequireAuth>
            <RequireMeds>
              <Today />
            </RequireMeds>
          </RequireAuth>
        }
      />
      <Route
        path="/week"
        element={
          <RequireAuth>
            <Week />
          </RequireAuth>
        }
      />
      <Route
        path="/settings"
        element={
          <RequireAuth>
            <Settings />
          </RequireAuth>
        }
      />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
