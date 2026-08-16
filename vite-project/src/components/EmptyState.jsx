export function EmptyState({ title, body, actionLabel, onAction }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center gap-3 px-8 text-center">
      <h2 className="text-lg font-semibold">{title}</h2>
      {body && <p className="text-sm text-base-content/60">{body}</p>}
      {actionLabel && onAction && (
        <button className="btn btn-primary mt-2" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  )
}
