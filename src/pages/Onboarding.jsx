import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { MedForm } from '../components/MedForm'

export function Onboarding() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit({ name, dose_text, times }) {
    setSubmitting(true)
    setError(null)
    const { error } = await supabase.from('meds').insert({
      user_id: user.id,
      name,
      dose_text,
      times,
    })
    setSubmitting(false)
    if (error) {
      setError(error.message)
      return
    }
    navigate('/', { replace: true })
  }

  return (
    <div className="max-w-md mx-auto min-h-dvh flex flex-col justify-center px-6 py-10">
      <div className="anim-rise mb-6">
        <h1 className="text-2xl font-bold">Bitta doridan boshlaymiz.</h1>
        <div className="anim-underline mt-2 h-0.5 w-16 rounded-full bg-primary/70" />
      </div>
      {error && (
        <div className="anim-rise alert alert-error mb-4 text-sm" role="alert">
          <span>{error}</span>
        </div>
      )}
      <div className="anim-rise" style={{ '--i': 2 }}>
        <MedForm onSubmit={handleSubmit} submitting={submitting} />
      </div>
    </div>
  )
}
