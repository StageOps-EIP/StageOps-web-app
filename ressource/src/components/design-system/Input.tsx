import { InputHTMLAttributes, forwardRef } from 'react';
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
          <label className="block text-sm font-medium text-[#f5f5f7] mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71717a]">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`w-full bg-[#1c1c21] border border-[#27272e] rounded-xl px-4 py-2.5 text-[#f5f5f7] placeholder:text-[#71717a] focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all ${
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

interface SearchInputProps extends Omit<InputProps, 'icon'> {}

export function SearchInput(props: SearchInputProps) {
  return <Input icon={<Search size={18} />} {...props} />;
}
