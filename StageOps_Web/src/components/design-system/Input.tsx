import { Search } from 'lucide-react';
import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', ...props }, ref) => (
    <div className="w-full">
      {label && <label className="mb-2 block text-xs font-semibold text-content-muted">{label}</label>}
      <div className="group relative">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-content-subtle transition-colors group-focus-within:text-cyan-400">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={`w-full rounded-xl border bg-theme-elevated px-4 py-3 text-sm text-content-primary shadow-inner shadow-black/5 placeholder:text-content-faint transition-all hover:border-theme-border-hover focus:border-cyan-400/50 focus:bg-theme-base focus:outline-none focus:ring-4 focus:ring-cyan-400/10 ${
            icon ? 'pl-11' : ''
          } ${error ? 'border-red-500/70' : 'border-theme-border'} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
    </div>
  ),
);

Input.displayName = 'Input';

interface SearchInputProps extends Omit<InputProps, 'icon'> {
  'aria-label'?: string;
}

export function SearchInput({ 'aria-label': ariaLabel, ...props }: SearchInputProps) {
  return <Input icon={<Search size={17} />} aria-label={ariaLabel ?? 'Rechercher'} {...props} />;
}
