import { Search } from 'lucide-react'
import { forwardRef, useId, type InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label, error, icon, id, className = '',
      'aria-describedby': describedBy, 'aria-invalid': invalid, ...props
    },
    ref,
  ) => {
    const generatedId = useId()
    const inputId = id ?? generatedId
    const errorId = `${inputId}-error`

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-content-muted">
            {label}
          </label>
        )}
        <div className="group relative">
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-content-faint transition-colors group-focus-within:text-[var(--brand-violet-hover)]">
              {icon}
            </div>
          )}
          <input
            {...props}
            ref={ref}
            id={inputId}
            aria-invalid={error ? true : invalid}
            aria-describedby={error ? [describedBy, errorId].filter(Boolean).join(' ') : describedBy}
            className={`form-control px-4 py-2.5 placeholder:text-content-faint ${
              icon ? 'pl-11' : ''
            } ${error ? 'border-[var(--status-danger)]' : ''} ${className}`}
          />
        </div>
        {error && <p id={errorId} role="alert" className="mt-1.5 text-sm text-red-800">{error}</p>}
      </div>
    )
  },
)

Input.displayName = 'Input'

interface SearchInputProps extends Omit<InputProps, 'icon'> {
  'aria-label'?: string
}

export function SearchInput({ 'aria-label': ariaLabel, ...props }: SearchInputProps) {
  return <Input icon={<Search size={16} />} aria-label={ariaLabel ?? 'Rechercher'} {...props} />
}
