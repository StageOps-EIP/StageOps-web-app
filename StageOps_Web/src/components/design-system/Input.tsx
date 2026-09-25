import { Search } from 'lucide-react'
import { forwardRef, type InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-content-muted">{label}</label>
      )}
      <div className="group relative">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-content-faint transition-colors group-focus-within:text-cyan-300">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={`form-control px-4 py-2.5 placeholder:text-content-faint ${
            icon ? 'pl-11' : ''
          } ${error ? 'border-red-500/70' : 'border-theme-border'} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
    </div>
  ),
)

Input.displayName = 'Input'

interface SearchInputProps extends Omit<InputProps, 'icon'> {
  'aria-label'?: string
}

export function SearchInput({ 'aria-label': ariaLabel, ...props }: SearchInputProps) {
  return <Input icon={<Search size={16} />} aria-label={ariaLabel ?? 'Rechercher'} {...props} />
}
