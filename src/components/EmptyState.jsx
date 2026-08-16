export function EmptyState({ title, body, actionLabel, onAction }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center gap-3 px-8 text-center">
      <div
        className="anim-pop flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"
        aria-hidden="true"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-7 w-7"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="1.75"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 2" />
          <circle cx="12" cy="13" r="8" strokeLinecap="round" strokeLinejoin="round" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 3h6M12 3v2" />
        </svg>
      </div>
      <h2 className="anim-rise text-lg font-semibold" style={{ '--i': 1 }}>
        {title}
      </h2>
      {body && (
        <p className="anim-rise text-sm text-base-content/60" style={{ '--i': 2 }}>
          {body}
        </p>
      )}
      {actionLabel && onAction && (
        <button
          className="anim-rise btn btn-primary tap mt-2"
          style={{ '--i': 3 }}
          onClick={onAction}
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
