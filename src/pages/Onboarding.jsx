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
      <h1 className="text-2xl font-bold mb-6">Bitta doridan boshlaymiz.</h1>
      {error && (
        <div className="alert alert-error mb-4 text-sm" role="alert">
          <span>{error}</span>
        </div>
      )}
      <MedForm onSubmit={handleSubmit} submitting={submitting} />
    </div>
  )
}
