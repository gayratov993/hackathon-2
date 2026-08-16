import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function Login() {
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const { error } = mode === 'signin' ? await signIn(email, password) : await signUp(email, password)

    setSubmitting(false)

    if (error) {
      setError(error.message)
      return
    }

    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Dori Vaqti</h1>

        <form onSubmit={handleSubmit} className="card bg-base-100 shadow-sm">
          <div className="card-body gap-3">
            {error && (
              <div role="alert" className="alert alert-error text-sm">
                <span>{error}</span>
              </div>
            )}

            <label className="fieldset-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              className="input input-bordered w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
            />

            <label className="fieldset-label" htmlFor="password">
              Parol
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              className="input input-bordered w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
            />

            <button type="submit" className="btn btn-primary mt-2" disabled={submitting}>
              {submitting && <span className="loading loading-spinner loading-sm" />}
              {mode === 'signin' ? 'Kirish' : "Ro'yxatdan o'tish"}
            </button>

            <button
              type="button"
              className="btn btn-ghost btn-sm"
              disabled={submitting}
              onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin')
                setError(null)
              }}
            >
              {mode === 'signin'
                ? "Hisobingiz yo'qmi? Ro'yxatdan o'ting"
                : 'Hisobingiz bormi? Kiring'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
