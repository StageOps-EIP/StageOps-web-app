import type { InputHTMLAttributes} from 'react';
import { forwardRef } from 'react';
import { Search } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-content-primary mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-content-subtle">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`w-full bg-theme-elevated border border-theme-border rounded-xl px-4 py-2.5 text-content-primary placeholder:text-content-subtle focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all ${
              icon ? 'pl-10' : ''
            } ${error ? 'border-red-500' : ''} ${className}`}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

interface SearchInputProps extends Omit<InputProps, 'icon'> {
  'aria-label'?: string;
}

export function SearchInput({ 'aria-label': ariaLabel, ...props }: SearchInputProps) {
  return (
    <Input
      icon={<Search size={18} />}
      aria-label={ariaLabel ?? 'Rechercher'}
      {...props}
    />
  );
}
