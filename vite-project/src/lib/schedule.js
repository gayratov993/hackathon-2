/**
 * Pure functions: build today's dose list, streak, and week summary.
 * No React or Supabase dependencies. Testable in isolation.
 */

/**
 * Fixture sample data for standalone testing and development
 */
export const SAMPLE_MEDS = [
  {
    id: 'med-1',
    user_id: 'user-1',
    name: 'Ertalabki dori',
    dose_text: '1 tabletka',
    times: ['08:00', '20:00'],
    active: true,
    created_at: '2026-08-10T00:00:00.000Z',
  },
  {
    id: 'med-2',
    user_id: 'user-1',
    name: 'Vitamin D',
    dose_text: '2 tomchi',
    times: ['13:00'],
    active: true,
    created_at: '2026-08-12T00:00:00.000Z',
  },
]

export const SAMPLE_LOGS = [
  {
    id: 'log-1',
    user_id: 'user-1',
    med_id: 'med-1',
    scheduled_for: '2026-08-16T08:00:00.000Z',
    status: 'taken',
    logged_at: '2026-08-16T08:05:00.000Z',
  },
]

/**
 * Helper: Format a Date to YYYY-MM-DD in local time
 */
export function formatLocalDateKey(date) {
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Helper: Normalize to start of local day (00:00:00.000)
 */
export function startOfLocalDay(date) {
  const d = new Date(date)
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0)
}

/**
 * Helper: Parse time string ('08:00', '8:00', '08:00:00') into { hours, minutes, seconds }
 */
export function parseTimeString(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') {
    return { hours: 0, minutes: 0, seconds: 0, formatted: '00:00' }
  }
  const parts = timeStr.trim().split(':')
  const hours = parseInt(parts[0], 10) || 0
  const minutes = parseInt(parts[1], 10) || 0
  const seconds = parseInt(parts[2], 10) || 0
  const formatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
  return { hours, minutes, seconds, formatted }
}

/**
 * Helper: Construct a local Date for a given date and time string
 */
export function createScheduledDate(baseDate, timeStr) {
  const d = new Date(baseDate)
  const { hours, minutes, seconds } = parseTimeString(timeStr)
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), hours, minutes, seconds, 0)
}

/**
 * Helper: Check if two dates represent the same scheduled slot (within same minute)
 */
function isSameSlot(date1, date2) {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return false
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate() &&
    d1.getHours() === d2.getHours() &&
    d1.getMinutes() === d2.getMinutes()
  )
}

/**
 * Builds the list of doses for today.
 *
 * @param {Array} meds - Array of medicine objects: [{ id, name, dose_text, times: ['08:00','20:00'], active, created_at }]
 * @param {Array} logs - Array of log entries: [{ med_id, scheduled_for, status, logged_at }]
 * @param {Date|string|number} [now=new Date()] - Current reference time
 * @returns {Array} List of dose items sorted chronologically:
 *   [{
 *      key: string,         // `${medId}-${isoTime}`
 *      medId: string,
 *      medName: string,
 *      doseText: string,
 *      at: Date,
 *      timeStr: string,     // e.g. "08:00"
 *      status: 'taken' | 'skipped' | 'pending' | 'overdue',
 *      log: object | null
 *   }]
 */
export function buildDoseList(meds = [], logs = [], now = new Date()) {
  if (!Array.isArray(meds) || meds.length === 0) {
    return []
  }

  const nowDate = new Date(now)
  const safeLogs = Array.isArray(logs) ? logs : []
  const todayStart = startOfLocalDay(nowDate)

  const doseList = []

  for (const med of meds) {
    // Only active meds are considered for today's active schedule
    if (med.active === false) {
      continue
    }

    // If med was created strictly after today, skip
    if (med.created_at) {
      const createdAt = new Date(med.created_at)
      const createdDayStart = startOfLocalDay(createdAt)
      if (createdDayStart.getTime() > todayStart.getTime()) {
        continue
      }
    }

    const rawTimes = Array.isArray(med.times)
      ? med.times
      : typeof med.times === 'string'
        ? [med.times]
        : ['08:00']

    for (const timeStr of rawTimes) {
      const { formatted } = parseTimeString(timeStr)
      const scheduledDate = createScheduledDate(todayStart, timeStr)
      const isoTime = scheduledDate.toISOString()
      const key = `${med.id}-${isoTime}`

      // Find matching log for this medicine and this scheduled time
      const matchingLog = safeLogs.find((log) => {
        if (!log || log.med_id !== med.id) return false
        return isSameSlot(log.scheduled_for, scheduledDate)
      }) || null

      let status = 'pending'
      if (matchingLog) {
        if (matchingLog.status === 'taken' || matchingLog.status === 'skipped') {
          status = matchingLog.status
        }
      } else {
        if (scheduledDate.getTime() < nowDate.getTime()) {
          status = 'overdue'
        } else {
          status = 'pending'
        }
      }

      doseList.push({
        key,
        medId: med.id,
        medName: med.name || "Nomsiz dori",
        doseText: med.dose_text || '',
        at: scheduledDate,
        timeStr: formatted,
        status,
        log: matchingLog,
      })
    }
  }

  // Sort by time ascending; if same time, sort alphabetically by medName
  doseList.sort((a, b) => {
    const timeDiff = a.at.getTime() - b.at.getTime()
    if (timeDiff !== 0) return timeDiff
    return a.medName.localeCompare(b.medName)
  })

  return doseList
}

/**
 * Calculates consecutive days back from today with at least one 'taken' dose.
 *
 * Rules:
 * - If today has ≥ 1 'taken' dose, streak counts today + consecutive taken previous days.
 * - If today has 0 'taken' dose (e.g. morning / pending), streak counts consecutive taken days starting from yesterday.
 * - If neither today nor yesterday has a 'taken' dose, streak is 0.
 *
 * @param {Array} logs - All med_logs entries
 * @param {Array} meds - Active meds (optional)
 * @param {Date|string|number} [today=new Date()] - Reference date
 * @returns {number} Count of consecutive days
 */
export function calcStreak(logs = [], meds = [], today = new Date()) {
  if (!Array.isArray(logs) || logs.length === 0) {
    return 0
  }

  const todayDate = new Date(today)
  const todayKey = formatLocalDateKey(todayDate)

  // Collect set of unique date keys that have at least one 'taken' log
  const takenDates = new Set()
  for (const log of logs) {
    if (log && log.status === 'taken' && log.scheduled_for) {
      const dateKey = formatLocalDateKey(log.scheduled_for)
      if (dateKey) {
        takenDates.add(dateKey)
      }
    }
  }

  if (takenDates.size === 0) {
    return 0
  }

  let streak = 0
  const hasTakenToday = takenDates.has(todayKey)

  if (hasTakenToday) {
    streak = 1
    // Check backwards from yesterday
    let cursor = new Date(todayDate)
    cursor.setDate(cursor.getDate() - 1)

    while (true) {
      const key = formatLocalDateKey(cursor)
      if (takenDates.has(key)) {
        streak++
        cursor.setDate(cursor.getDate() - 1)
      } else {
        break
      }
    }
  } else {
    // Check backwards starting from yesterday
    let cursor = new Date(todayDate)
    cursor.setDate(cursor.getDate() - 1)

    while (true) {
      const key = formatLocalDateKey(cursor)
      if (takenDates.has(key)) {
        streak++
        cursor.setDate(cursor.getDate() - 1)
      } else {
        break
      }
    }
  }

  return streak
}

/**
 * Generates a 7-day summary of doses for the current week (Monday to Sunday).
 *
 * @param {Array} logs - All med_logs entries
 * @param {Array} meds - All meds
 * @param {Date|string|number} [today=new Date()] - Reference date
 * @returns {Object} { taken: number, total: number, days: Array }
 */
export function weekSummary(logs = [], meds = [], today = new Date()) {
  const safeMeds = Array.isArray(meds) ? meds : []
  const safeLogs = Array.isArray(logs) ? logs : []
  const refDate = new Date(today)

  // Determine Monday of current week (ISO week: 1=Mon, ..., 0=Sun)
  const dayOfWeek = refDate.getDay()
  const distanceToMonday = (dayOfWeek + 6) % 7
  const monday = new Date(refDate.getFullYear(), refDate.getMonth(), refDate.getDate() - distanceToMonday, 0, 0, 0, 0)

  const dayLabels = ['Du', 'Se', 'Chor', 'Pay', 'Jum', 'Shan', 'Yak']
  const dayFullLabels = [
    'Dushanba',
    'Seshanba',
    'Chorshanba',
    'Payshanba',
    'Juma',
    'Shanba',
    'Yakshanba',
  ]

  const days = []
  let totalTakenWeek = 0
  let totalExpectedWeek = 0

  const todayStart = startOfLocalDay(refDate)

  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i, 0, 0, 0, 0)
    const dayKey = formatLocalDateKey(dayDate)
    const isToday = dayDate.getTime() === todayStart.getTime()
    const isFuture = dayDate.getTime() > todayStart.getTime()

    // Count taken and skipped logs on this day
    const dayLogs = safeLogs.filter((log) => {
      if (!log || !log.scheduled_for) return false
      return formatLocalDateKey(log.scheduled_for) === dayKey
    })

    const takenCount = dayLogs.filter((l) => l.status === 'taken').length
    const skippedCount = dayLogs.filter((l) => l.status === 'skipped').length

    // Calculate expected total doses for this day across active meds
    let expectedCount = 0
    const dayDoses = []

    for (const med of safeMeds) {
      if (med.active === false) continue

      // Edge case: med added mid-week (no expected doses before created_at date)
      if (med.created_at) {
        const medCreatedDay = startOfLocalDay(new Date(med.created_at))
        if (dayDate.getTime() < medCreatedDay.getTime()) {
          continue
        }
      }

      const rawTimes = Array.isArray(med.times)
        ? med.times
        : typeof med.times === 'string'
          ? [med.times]
          : ['08:00']

      for (const timeStr of rawTimes) {
        const { formatted } = parseTimeString(timeStr)
        const scheduledDate = createScheduledDate(dayDate, timeStr)
        expectedCount++

        const matchingLog = dayLogs.find((l) => l.med_id === med.id && isSameSlot(l.scheduled_for, scheduledDate))

        let status = 'pending'
        if (matchingLog) {
          status = matchingLog.status
        } else if (isFuture) {
          status = 'future'
        } else if (scheduledDate.getTime() < refDate.getTime()) {
          status = 'overdue'
        }

        dayDoses.push({
          medId: med.id,
          medName: med.name,
          time: formatted,
          scheduled_for: scheduledDate.toISOString(),
          status,
        })
      }
    }

    totalTakenWeek += takenCount
    totalExpectedWeek += expectedCount

    days.push({
      date: dayDate,
      dateStr: dayKey,
      dayLabel: dayLabels[i],
      dayFullLabel: dayFullLabels[i],
      taken: takenCount,
      skipped: skippedCount,
      total: expectedCount,
      isToday,
      isFuture,
      doses: dayDoses,
    })
  }

  return {
    taken: totalTakenWeek,
    total: totalExpectedWeek,
    days,
  }
}
