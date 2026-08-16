const WEEKDAY_LABELS = ['Ya', 'Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh']

function cellState(day) {
  if (day.total === 0) return 'faint'
  if (day.taken === day.total) return 'full'
  if ((day.skipped ?? 0) > 0 || day.taken > 0) return 'hollow'
  return 'empty'
}

const cellClasses = {
  full: 'bg-success border-success text-success-content',
  hollow: 'border-success border-2 bg-transparent',
  empty: 'border border-base-300 bg-base-200',
  faint: 'border border-dashed border-base-300 bg-base-200/40',
}

const legend = [
  { state: 'full', label: 'belgilangan' },
  { state: 'hollow', label: 'qisman yoki o\'tkazilgan' },
  { state: 'empty', label: 'belgilanmagan' },
  { state: 'faint', label: 'dori hali yo\'q edi' },
]

export function WeekGrid({ days }) {
  return (
    <div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => (
          <div key={index} className="flex flex-col items-center gap-1">
            <span className="text-xs text-base-content/60">
              {WEEKDAY_LABELS[new Date(day.date).getDay()]}
            </span>
            <span className="text-xs text-base-content/40">{new Date(day.date).getDate()}</span>
            <div className={`h-10 w-full rounded-lg ${cellClasses[cellState(day)]}`} />
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
        {legend.map(({ state, label }) => (
          <div key={state} className="flex items-center gap-2">
            <div className={`h-4 w-4 shrink-0 rounded ${cellClasses[state]}`} />
            <span className="text-xs text-base-content/60">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
