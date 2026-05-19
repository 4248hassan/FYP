export default function Loader({ label = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center py-6">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-sky-600 border-t-transparent" />
      {label && (
        <span className="ml-2 text-sm text-slate-600">{label}</span>
      )}
    </div>
  )
}

