import { forwardRef, type ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = 'primary', size = 'md', fullWidth = false, className = '', children, ...props },
    ref,
  ) => {
    const baseStyles =
      'group relative inline-flex items-center justify-center rounded-md border font-semibold transition-colors duration-150 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none'

    const variants = {
      primary:
        'border-transparent bg-[var(--brand-violet)] text-white hover:bg-[var(--brand-violet-hover)]',
      secondary:
        'border-theme-border bg-theme-elevated text-content-primary hover:border-theme-border-hover hover:bg-[var(--bg-hover)]',
      ghost:
        'border-transparent text-content-muted hover:border-theme-border hover:bg-theme-elevated hover:text-content-primary',
      danger: 'border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500 hover:text-white',
    }

    const sizes = {
      sm: 'gap-1.5 px-3 py-1.5 text-xs',
      md: 'gap-2 px-4 py-2.5 text-sm',
      lg: 'gap-2 px-5 py-3 text-sm',
    }

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
        {...props}
      >
        {children}
      </button>
    )
  },
)

Button.displayName = 'Button'
