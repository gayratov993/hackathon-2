import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Nav } from '../components/Nav'
import { EmptyState } from '../components/EmptyState'
import { WeekGrid } from '../components/WeekGrid'

// B owns lib/schedule.js. Until calcStreak/weekSummary land there we use an
// equivalent local implementation so this screen works on its own branch too.
const schedulePromise = import('../lib/schedule').catch(() => ({}))

function dayKey(date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

function fallbackCalcStreak(logs, _meds, today) {
  const takenDays = new Set()
  for (const log of logs) {
    if (log.status === 'taken') takenDays.add(dayKey(new Date(log.scheduled_for)))
  }
  const cursor = new Date(today)
  cursor.setHours(0, 0, 0, 0)
  if (!takenDays.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1)
  let streak = 0
  while (takenDays.has(dayKey(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

function fallbackWeekSummary(logs, meds, today) {
  const start = new Date(today)
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - 6)
  const days = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(start)
    date.setDate(start.getDate() + i)
    days.push({ date, taken: 0, skipped: 0, total: 0 })
  }
  for (const med of meds) {
    if (med.active === false) continue
    const created = med.created_at ? new Date(med.created_at) : null
    const createdDay = created
      ? new Date(created.getFullYear(), created.getMonth(), created.getDate())
      : null
    const times = Array.isArray(med.times) ? med.times : []
    for (const day of days) {
      if (createdDay && day.date < createdDay) continue
      day.total += times.length
    }
  }
  const byDay = new Map(days.map((d) => [dayKey(d.date), d]))
  for (const log of logs) {
    const day = byDay.get(dayKey(new Date(log.scheduled_for)))
    if (!day) continue
    if (log.status === 'taken') day.taken += 1
    else if (log.status === 'skipped') day.skipped += 1
  }
  const taken = days.reduce((sum, d) => sum + d.taken, 0)
  const total = days.reduce((sum, d) => sum + d.total, 0)
  return { taken, total, days }
}

export function Week() {
  const { user } = useAuth()
  const [schedule, setSchedule] = useState(null)
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    schedulePromise.then((mod) => {
      if (!active) return
      setSchedule({
        calcStreak: mod.calcStreak ?? fallbackCalcStreak,
        weekSummary: mod.weekSummary ?? fallbackWeekSummary,
      })
    })
    return () => {
      active = false
    }
  }, [])

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

  if (!schedule || !data) {
    return (
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="skeleton h-8 w-40 mb-4" />
        <div className="skeleton h-48 w-full" />
        <Nav />
      </div>
    )
  }

  const today = new Date()
  const summary = schedule.weekSummary(data.logs, data.meds, today)
  const streak = schedule.calcStreak(data.logs, data.meds, today)

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
