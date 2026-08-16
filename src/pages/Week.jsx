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
        <h1 className="text-xl font-bold mb-6">Hafta</h1>
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
      <h1 className="text-xl font-bold mb-1">Hafta</h1>
      <div className="flex items-center gap-2 mb-1">
        <span className="badge badge-primary">{streak} kunlik seriya</span>
      </div>
      <p className="text-sm text-base-content/60 mb-6">
        Bu hafta {summary.total} dozadan {summary.taken} tasini belgiladingiz.
      </p>
      <WeekGrid days={summary.days} />
      <Nav />
    </div>
  )
}
