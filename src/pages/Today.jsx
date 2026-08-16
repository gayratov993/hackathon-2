import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { buildDoseList, calcStreak, formatLocalDateKey } from '../lib/schedule'
import { DoseCard } from '../components/DoseCard'
import { EmptyState } from '../components/EmptyState'
import { Nav } from '../components/Nav'

/**
 * Format a Date into Uzbek text: e.g. "16-avgust, yakshanba"
 */
function formatUzbekDate(date) {
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''

  const months = [
    'yanvar',
    'fevral',
    'mart',
    'aprel',
    'may',
    'iyun',
    'iyul',
    'avgust',
    'sentabr',
    'oktabr',
    'noyabr',
    'dekabr',
  ]
  const weekdays = [
    'yakshanba',
    'dushanba',
    'seshanba',
    'chorshanba',
    'payshanba',
    'juma',
    'shanba',
  ]

  const day = d.getDate()
  const month = months[d.getMonth()]
  const weekday = weekdays[d.getDay()]

  return `${day}-${month}, ${weekday}`
}

export function Today() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [meds, setMeds] = useState([])
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyKey, setBusyKey] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const [now, setNow] = useState(() => new Date())

  // Update `now` every minute so overdue statuses update seamlessly
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date())
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  // Fetch active meds and logs for user
  const fetchData = useCallback(async () => {
    if (!user) return

    setLoading(true)
    setErrorMessage(null)

    // Fetch active meds
    const { data: medsData, error: medsError } = await supabase
      .from('meds')
      .select('*')
      .eq('user_id', user.id)
      .eq('active', true)
      .order('created_at', { ascending: true })

    if (medsError) {
      setErrorMessage("Dorilarni yuklashda xatolik yuz berdi.")
      setLoading(false)
      return
    }

    // Fetch logs
    const { data: logsData, error: logsError } = await supabase
      .from('med_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('scheduled_for', { ascending: true })

    if (logsError) {
      setErrorMessage("Jurnallarni yuklashda xatolik yuz berdi.")
      setLoading(false)
      return
    }

    setMeds(medsData || [])
    setLogs(logsData || [])
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Build today's dose list from pure schedule logic
  const doseList = useMemo(() => {
    return buildDoseList(meds, logs, now)
  }, [meds, logs, now])

  // Calculate streak from all logs
  const streak = useMemo(() => {
    return calcStreak(logs, meds, now)
  }, [logs, meds, now])

  // Doses statistics for today
  const totalDoses = doseList.length
  const takenDoses = doseList.filter((d) => d.status === 'taken').length
  const progressPercent = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 0

  // Log a dose action (optimistic update with rollback on error)
  const handleLogDose = async (dose, status) => {
    if (!user || busyKey === dose.key) return

    setBusyKey(dose.key)
    setErrorMessage(null)

    const scheduledIso = dose.at.toISOString()
    const previousLogs = [...logs]

    // Optimistic local state update
    const existingIndex = logs.findIndex(
      (l) =>
        l.med_id === dose.medId &&
        formatLocalDateKey(l.scheduled_for) === formatLocalDateKey(dose.at) &&
        new Date(l.scheduled_for).getHours() === dose.at.getHours() &&
        new Date(l.scheduled_for).getMinutes() === dose.at.getMinutes()
    )

    let optimisticLogs
    if (existingIndex >= 0) {
      optimisticLogs = logs.map((l, idx) =>
        idx === existingIndex
          ? { ...l, status, logged_at: new Date().toISOString() }
          : l
      )
    } else {
      optimisticLogs = [
        ...logs,
        {
          id: `temp-${Date.now()}`,
          user_id: user.id,
          med_id: dose.medId,
          scheduled_for: scheduledIso,
          status,
          logged_at: new Date().toISOString(),
        },
      ]
    }

    setLogs(optimisticLogs)

    // Call Supabase upsert
    const { data, error } = await supabase
      .from('med_logs')
      .upsert(
        {
          user_id: user.id,
          med_id: dose.medId,
          scheduled_for: scheduledIso,
          status,
          logged_at: new Date().toISOString(),
        },
        { onConflict: 'med_id,scheduled_for' }
      )
      .select()

    if (error) {
      // Roll back optimistic state on error
      setLogs(previousLogs)
      setErrorMessage("Dozani saqlashda xatolik yuz berdi. Qaytadan urinib ko'ring.")
    } else if (data && data.length > 0) {
      // Replace temporary entry with server confirmed row
      const savedRow = data[0]
      setLogs((current) =>
        current.map((l) =>
          l.med_id === dose.medId && l.scheduled_for === scheduledIso ? savedRow : l
        )
      )
    }

    setBusyKey(null)
  }

  const handleTaken = (dose) => handleLogDose(dose, 'taken')
  const handleSkipped = (dose) => handleLogDose(dose, 'skipped')

  return (
    <div className="min-h-screen flex flex-col justify-between max-w-md mx-auto">
      {/* Main Content Area */}
      <main className="flex-1 px-4 pt-6 pb-24 w-full">
        {/* Error Toast Notification */}
        {errorMessage && (
          <div role="alert" className="alert alert-error mb-4 shadow-sm text-sm py-3 px-4 flex items-center justify-between rounded-xl">
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 shrink-0 stroke-current"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-xs btn-circle"
              onClick={() => setErrorMessage(null)}
              aria-label="Xabarni yopish"
            >
              ✕
            </button>
          </div>
        )}

        {/* State 1: Skeleton Loading */}
        {loading ? (
          <section className="space-y-4" aria-label="Yuklanmoqda">
            {/* Header Skeleton */}
            <div className="space-y-3 pb-2 border-b border-base-200">
              <div className="flex items-center justify-between">
                <div className="skeleton h-7 w-40 rounded-lg" />
                <div className="skeleton h-6 w-24 rounded-full" />
              </div>
              <div className="flex items-center justify-between">
                <div className="skeleton h-4 w-28 rounded" />
                <div className="skeleton h-4 w-12 rounded" />
              </div>
              <div className="skeleton h-2 w-full rounded-full" />
            </div>

            {/* Dose Cards Skeletons */}
            <div className="space-y-3 pt-2">
              <div className="skeleton h-28 w-full rounded-2xl" />
              <div className="skeleton h-28 w-full rounded-2xl" />
            </div>
          </section>
        ) : meds.length === 0 ? (
          /* State 2: Empty State (No active medicines) */
          <section className="py-12" aria-label="Dorilar mavjud emas">
            <EmptyState
              title="Dorilar ro'yxati bo'sh"
              body="Boshlash uchun birinchi doringizni qo'shing."
              actionLabel="Dori qo'shish"
              onAction={() => navigate('/onboarding')}
            />
          </section>
        ) : (
          /* State 3: Today's Schedule & Dose List */
          <section className="space-y-5" aria-label="Bugungi reja">
            {/* Today's Header */}
            <header className="space-y-3 pb-2 border-b border-base-200/80">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-base-content capitalize">
                    {formatUzbekDate(now)}
                  </h1>
                </div>

                {/* Streak Badge */}
                <div
                  className={`badge ${
                    streak > 0
                      ? 'badge-primary badge-outline font-semibold gap-1.5 py-3 px-3 shadow-2xs'
                      : 'badge-ghost text-xs text-base-content/60 py-3 px-2.5'
                  }`}
                  title={`${streak} kunlik seriya`}
                >
                  {streak > 0 ? (
                    <>
                      <span aria-hidden="true">🔥</span>
                      <span>{streak} kun ketma-ket</span>
                    </>
                  ) : (
                    <span>0 kun</span>
                  )}
                </div>
              </div>

              {/* Progress Summary Line */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs sm:text-sm font-medium text-base-content/70">
                  <span>Bugun: {takenDoses} / {totalDoses}</span>
                  <span className="font-mono text-xs">{progressPercent}%</span>
                </div>
                <progress
                  className="progress progress-primary w-full h-2 rounded-full transition-all duration-300"
                  value={takenDoses}
                  max={totalDoses || 1}
                  aria-label={`Bugungi dorilar bajarilishi: ${takenDoses} / ${totalDoses}`}
                />
              </div>
            </header>

            {/* Dose Cards List */}
            <div className="space-y-3 pt-1">
              {doseList.map((dose) => (
                <DoseCard
                  key={dose.key}
                  dose={dose}
                  onTaken={handleTaken}
                  onSkipped={handleSkipped}
                  busy={busyKey === dose.key}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Bottom Navigation */}
      <Nav />
    </div>
  )
}
