import { useState } from 'react'

export function SettingRow({
  label,
  description,
  children,
}: {
  label: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-start gap-3 border-b border-theme-border py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="flex-1 sm:pr-8">
        <p className="text-sm text-content-primary">{label}</p>
        {description && <p className="text-xs text-content-subtle mt-0.5">{description}</p>}
      </div>
      <div className="w-full shrink-0 sm:w-auto">{children}</div>
    </div>
  )
}

export function Toggle({
  defaultChecked = false,
  disabled = false,
  label,
}: {
  defaultChecked?: boolean
  disabled?: boolean
  label: string
}) {
  const [checked, setChecked] = useState(defaultChecked)
  return (
    <button
      type="button"
      onClick={() => setChecked(!checked)}
      disabled={disabled}
      aria-label={label}
      aria-pressed={checked}
      className={`relative h-6 w-11 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${
        checked ? 'bg-[var(--brand-violet)]' : 'bg-theme-raised'
      }`}
    >
      <div
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-5.5' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}
