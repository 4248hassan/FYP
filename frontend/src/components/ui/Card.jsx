export default function Card({ header, children, className = '' }) {
  return (
    <div
      className={`rounded-xl bg-white shadow-sm ring-1 ring-slate-200 ${className}`}
    >
      {header && (
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-900">{header}</h2>
        </div>
      )}
      <div className="px-4 py-3 text-sm text-slate-700">{children}</div>
    </div>
  )
}

