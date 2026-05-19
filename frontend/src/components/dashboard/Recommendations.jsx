import React from 'react'

export default function Recommendations({ items = [] }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-900">Recommended for you</h3>
      <div className="mt-3 grid gap-3">
        {items.map((it) => (
          <div key={it.title} className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-slate-100" />
            <div>
              <p className="text-sm font-medium text-slate-900">{it.title}</p>
              <p className="text-xs text-slate-500">{it.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
