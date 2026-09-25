import { forwardRef, type ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', fullWidth = false, className = '', children, ...props }, ref) => {
    const baseStyles =
      'group relative inline-flex items-center justify-center overflow-hidden border font-mono font-bold uppercase tracking-[0.08em] transition-all duration-200 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none active:translate-y-px';

    const variants = {
      primary: 'border-cyan-400 bg-cyan-500 text-white hover:bg-cyan-400',
      secondary: 'border-theme-border-strong bg-transparent text-content-primary hover:border-cyan-400/60 hover:bg-cyan-400/[0.07]',
      ghost: 'border-transparent text-content-muted hover:border-theme-border hover:bg-theme-elevated hover:text-content-primary',
      danger: 'border-red-400/50 bg-red-500/15 text-red-300 hover:bg-red-500 hover:text-white',
    };

    const sizes = {
      sm: 'gap-1.5 px-3 py-1.5 text-[10px]',
      md: 'gap-2 px-4 py-2.5 text-[11px]',
      lg: 'gap-2.5 px-5 py-3.5 text-xs',
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
        style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)' }}
        {...props}
      >
        <span className="relative contents">{children}</span>
      </button>
    );
  },
);

Button.displayName = 'Button';
