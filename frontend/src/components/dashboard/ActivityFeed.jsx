import React from 'react'

export default function ActivityFeed({ items = [] }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-900">Recent Activity</h3>
      <div className="mt-3 space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-slate-500">No recent activity</p>
        ) : (
          items.map((it) => (
            <div key={it.id} className="flex items-start gap-3">
              <div className="h-8 w-8 shrink-0 rounded-full bg-slate-100" />
              <div>
                <p className="text-sm text-slate-700">{it.text}</p>
                <p className="text-xs text-slate-400">{it.time}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
