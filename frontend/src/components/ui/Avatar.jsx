import { useState, useEffect } from 'react'

const BACKGROUND_COLORS = [
  'bg-red-500 text-white',
  'bg-pink-500 text-white',
  'bg-purple-500 text-white',
  'bg-indigo-500 text-white',
  'bg-blue-500 text-white',
  'bg-sky-500 text-white',
  'bg-cyan-500 text-white',
  'bg-teal-500 text-white',
  'bg-emerald-500 text-white',
  'bg-green-500 text-white',
  'bg-orange-500 text-white',
  'bg-amber-500 text-white',
]

const getBackgroundFromName = (name) => {
  if (!name) return 'bg-slate-500 text-white'
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % BACKGROUND_COLORS.length
  return BACKGROUND_COLORS[index]
}

export default function Avatar({
  src,
  name,
  sizeClassName = 'h-10 w-10 text-sm',
  className = '',
  ...props
}) {
  const [hasError, setHasError] = useState(false)

  // Reset error state when src changes
  useEffect(() => {
    setHasError(false)
  }, [src])

  const getInitials = () => {
    if (!name || typeof name !== 'string') return 'U'
    const trimmed = name.trim()
    return trimmed ? trimmed.charAt(0).toUpperCase() : 'U'
  }

  const initials = getInitials()
  const bgClass = getBackgroundFromName(name || initials)

  if (src && !hasError) {
    return (
      <img
        src={src}
        alt={name || 'User Avatar'}
        onError={() => setHasError(true)}
        className={`rounded-full object-cover flex-shrink-0 ${sizeClassName} ${className}`}
        {...props}
      />
    )
  }

  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold uppercase select-none flex-shrink-0 ${bgClass} ${sizeClassName} ${className}`}
      {...props}
    >
      {initials}
    </div>
  )
}
