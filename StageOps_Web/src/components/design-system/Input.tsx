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
      {label && <label className="control-label mb-2 block text-content-subtle">{label}</label>}
      <div className="group relative">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-content-faint transition-colors group-focus-within:text-cyan-300">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={`w-full border bg-theme-deeper px-4 py-3 text-sm text-content-primary placeholder:text-content-faint transition-all hover:border-theme-border-hover focus:border-cyan-400/60 focus:bg-theme-base focus:outline-none ${
            icon ? 'pl-11' : ''
          } ${error ? 'border-red-500/70' : 'border-theme-border'} ${className}`}
          {...props}
        />
        <span className="pointer-events-none absolute bottom-0 left-0 h-px w-0 bg-cyan-400 transition-all duration-300 group-focus-within:w-full" />
      </div>
      {error && <p className="mt-1.5 font-mono text-[10px] uppercase tracking-wider text-red-400">{error}</p>}
    </div>
  ),
);

Input.displayName = 'Input';

interface SearchInputProps extends Omit<InputProps, 'icon'> {
  'aria-label'?: string;
}

export function SearchInput({ 'aria-label': ariaLabel, ...props }: SearchInputProps) {
  return <Input icon={<Search size={16} />} aria-label={ariaLabel ?? 'Rechercher'} {...props} />;
}
