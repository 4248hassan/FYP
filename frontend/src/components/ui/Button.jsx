const baseClasses =
  'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60'

const variants = {
  primary:
    'bg-sky-600 text-white hover:bg-sky-500 focus-visible:ring-sky-600 focus-visible:ring-offset-white',
  secondary:
    'border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 focus-visible:ring-sky-600 focus-visible:ring-offset-white',
  ghost:
    'bg-transparent text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-400 focus-visible:ring-offset-white',
}

export default function Button({
  children,
  onClick,
  className = '',
  variant = 'primary',
  type = 'button',
  ...props
}) {
  const variantClasses = variants[variant] || variants.primary

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

