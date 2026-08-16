import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Nav } from '../components/Nav'
import { EmptyState } from '../components/EmptyState'
import { WeekGrid } from '../components/WeekGrid'

import { calcStreak, weekSummary } from '../lib/schedule'

export function Week() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) return
    let active = true
    Promise.all([
      supabase.from('meds').select('id, name, times, created_at, active').eq('user_id', user.id),
      supabase
        .from('med_logs')
        .select('med_id, scheduled_for, status')
        .eq('user_id', user.id),
    ]).then(([{ data: meds, error: medsError }, { data: logs, error: logsError }]) => {
      if (!active) return
      if (medsError || logsError) {
        setError((medsError ?? logsError).message)
        return
      }
      setData({ meds: meds ?? [], logs: logs ?? [] })
    })
    return () => {
      active = false
    }
  }, [user])

  if (error) {
    return (
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="alert alert-error" role="alert">
          <span>{error}</span>
        </div>
        <Nav />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="skeleton h-8 w-40 mb-4" />
        <div className="skeleton h-48 w-full" />
        <Nav />
      </div>
    )
  }

  const today = new Date()
  const summary = weekSummary(data.logs, data.meds, today)
  const streak = calcStreak(data.logs, data.meds, today)

  if (data.meds.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-6 pb-36">
        <h1 className="anim-rise text-xl font-bold mb-6">Hafta</h1>
        <EmptyState
          title="Birinchi kuningiz."
          body="Ertaga bu yer to'la boshlaydi."
        />
        <Nav />
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6 pb-36">
      <header className="anim-rise mb-6">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-xl font-bold">Hafta</h1>
          <span className="anim-pop badge badge-primary gap-1.5 py-3 shadow-2xs" style={{ '--i': 2 }}>
            <span className="anim-ember inline-block" aria-hidden="true">🔥</span>
            {streak} kunlik seriya
          </span>
        </div>
        <div className="anim-underline mt-1 h-0.5 w-12 rounded-full bg-primary/70" />

        <div className="mt-4 space-y-1.5">
          <p className="text-sm text-base-content/60">
            Bu hafta {summary.total} dozadan {summary.taken} tasini belgiladingiz.
          </p>
          <progress
            className="progress progress-primary w-full h-2 rounded-full"
            value={summary.taken}
            max={summary.total || 1}
            aria-label={`Bu hafta ${summary.total} dozadan ${summary.taken} tasi belgilangan`}
          />
        </div>
      </header>

      <WeekGrid days={summary.days} />
      <Nav />
    </div>
  )
}
