import { forwardRef, type ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', fullWidth = false, className = '', children, ...props }, ref) => {
    const baseStyles =
      'group relative inline-flex items-center justify-center overflow-hidden font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-theme-void active:translate-y-px';

    const variants = {
      primary:
        'bg-gradient-to-r from-cyan-500 to-brand-violet text-white shadow-[0_10px_28px_rgba(82,101,244,0.24)] hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(82,101,244,0.34)]',
      secondary:
        'border border-theme-border-hover bg-theme-base text-content-primary shadow-sm hover:-translate-y-0.5 hover:border-cyan-400/35 hover:bg-theme-elevated',
      ghost: 'text-content-muted hover:bg-cyan-400/10 hover:text-cyan-300',
      danger: 'border border-red-400/30 bg-red-500/90 text-white shadow-lg shadow-red-950/15 hover:bg-red-500',
    };

    const sizes = {
      sm: 'gap-1.5 rounded-lg px-3 py-1.5 text-xs',
      md: 'gap-2 rounded-xl px-4 py-2.5 text-sm',
      lg: 'gap-2.5 rounded-xl px-5 py-3 text-sm',
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
        {...props}
      >
        {variant === 'primary' && (
          <span className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-[500%]" />
        )}
        <span className="relative contents">{children}</span>
      </button>
    );
  },
);

Button.displayName = 'Button';
