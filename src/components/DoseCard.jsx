import React from 'react'

/**
 * Presentational card component for displaying and acting on a scheduled dose.
 *
 * Props:
 * @param {Object} dose - { key, medId, medName, doseText, at, timeStr, status }
 * @param {Function} onTaken - Callback when user logs the dose as 'taken'
 * @param {Function} onSkipped - Callback when user logs the dose as 'skipped'
 * @param {boolean} busy - True if this dose is currently performing an async action
 */
export function DoseCard({ dose, onTaken, onSkipped, busy = false, index = 0 }) {
  if (!dose) return null

  const { medName, doseText, timeStr, status } = dose
  const isPending = status === 'pending'
  const isOverdue = status === 'overdue'
  const isTaken = status === 'taken'
  const isSkipped = status === 'skipped'
  const canAct = isPending || isOverdue

  // Visual container styles based on state
  let containerClasses =
    'card bg-base-100 border rounded-2xl overflow-hidden anim-rise lift transition-colors duration-300'
  if (isOverdue) {
    containerClasses += ' border-warning/80 bg-warning/5 shadow-sm hover:shadow-md'
  } else if (isTaken) {
    containerClasses += ' border-success/30 bg-base-100/70 shadow-xs'
  } else if (isSkipped) {
    containerClasses += ' border-base-200/80 bg-base-200/30 opacity-70 shadow-none'
  } else {
    // Pending
    containerClasses += ' border-base-200/90 shadow-sm hover:shadow-md hover:border-base-300'
  }

  return (
    <article
      className={containerClasses}
      style={{ '--i': index }}
      data-status={status}
      aria-label={`${medName} - ${timeStr}`}
    >
      <div className="card-body p-4 sm:p-5">
        {/* Header row: Med Name, Dose Badge, Time / Status badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3
                className={`text-base sm:text-lg font-bold tracking-tight truncate ${
                  isSkipped ? 'text-base-content/70 line-through decoration-base-content/30' : 'text-base-content'
                }`}
              >
                {medName}
              </h3>
              {doseText && (
                <span className="badge badge-ghost badge-sm text-xs font-normal text-base-content/70 border-base-300/60">
                  {doseText}
                </span>
              )}
            </div>

            {/* Subtitle / Status note for overdue */}
            {isOverdue && (
              <div className="anim-fade mt-1 flex items-center gap-1.5 text-xs font-medium text-warning">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5 shrink-0 animate-pulse"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Belgilangan vaqt o&apos;tgan</span>
              </div>
            )}
          </div>

          {/* Time & Completed Badges */}
          <div className="flex items-center gap-2 shrink-0">
            {isTaken && (
              <div className="anim-pop badge badge-success text-success-content gap-1 text-xs font-semibold py-2.5 px-2.5 shadow-xs">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5 stroke-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>Ichildi</span>
              </div>
            )}

            {isSkipped && (
              <div className="anim-pop badge badge-neutral badge-outline text-xs py-2.5 px-2.5 text-base-content/60">
                <span>O&apos;tkazib yuborildi</span>
              </div>
            )}

            {/* Time Display */}
            <span
              className={`font-mono text-sm font-semibold px-2.5 py-1 rounded-lg ${
                isSkipped
                  ? 'line-through text-base-content/40 bg-base-200/50'
                  : isOverdue
                    ? 'text-warning-content bg-warning/20 font-bold'
                    : isTaken
                      ? 'text-base-content/60 bg-base-200/50'
                      : 'text-base-content/80 bg-base-200/60'
              }`}
            >
              {timeStr}
            </span>
          </div>
        </div>

        {/* Action Buttons: Pending or Overdue states */}
        {canAct && (
          <div className="anim-fade flex items-center gap-2.5 mt-4 pt-2 border-t border-base-200/60">
            {/* Ichdim button */}
            <button
              type="button"
              className="btn btn-primary tap group/take flex-1 min-h-[44px] h-[44px] rounded-xl font-medium shadow-xs hover:shadow-md hover:brightness-105 disabled:opacity-50"
              onClick={() => onTaken?.(dose)}
              disabled={busy}
              aria-label={`${medName} dorisini ichdim`}
            >
              {busy ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 stroke-2 transition-transform duration-300 group-hover/take:scale-125"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Ichdim</span>
                </>
              )}
            </button>

            {/* O'tkazib yubordim button */}
            <button
              type="button"
              className="btn btn-ghost tap flex-1 min-h-[44px] h-[44px] rounded-xl font-normal text-xs sm:text-sm text-base-content/70 hover:text-base-content hover:bg-base-200/60 disabled:opacity-50"
              onClick={() => onSkipped?.(dose)}
              disabled={busy}
              aria-label={`${medName} dorisini o'tkazib yubordim`}
            >
              {busy ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                <span>O&apos;tkazib yubordim</span>
              )}
            </button>
          </div>
        )}
      </div>
    </article>
  )
}
