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
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="anim-pop w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
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
          </div>
          <h1 className="anim-rise text-2xl font-bold tracking-tight" style={{ '--i': 1 }}>
            Dori Vaqti
          </h1>
          <p className="anim-rise text-sm text-base-content/60 mt-1" style={{ '--i': 2 }}>
            Dorilaringizni ichdingizmi — shuni belgilab boring.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="anim-rise card bg-base-100 border border-base-200 shadow-sm"
          style={{ '--i': 3 }}
        >
          <div className="card-body gap-3 p-6">
            {error && (
              <div role="alert" className="anim-rise alert alert-error text-sm py-2">
                <span>{error}</span>
              </div>
            )}

            <label className="flex flex-col gap-1" htmlFor="email">
              <span className="text-sm font-medium text-base-content/80">Email</span>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                className="input input-bordered w-full transition-all duration-200 focus:border-primary focus:shadow-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
              />
            </label>

            <label className="flex flex-col gap-1" htmlFor="password">
              <span className="text-sm font-medium text-base-content/80">Parol</span>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                className="input input-bordered w-full transition-all duration-200 focus:border-primary focus:shadow-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
              />
            </label>

            <button
              type="submit"
              className="btn btn-primary tap mt-3 min-h-[44px] hover:brightness-105 hover:shadow-md"
              disabled={submitting}
            >
              {submitting ? (
                <span className="loading loading-spinner loading-sm" />
              ) : mode === 'signin' ? (
                'Kirish'
              ) : (
                "Ro'yxatdan o'tish"
              )}
            </button>

            <button
              type="button"
              className="btn btn-ghost btn-sm font-normal text-base-content/70"
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
