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
      'group relative inline-flex min-h-10 items-center justify-center rounded-lg border font-semibold transition-colors duration-150 disabled:pointer-events-none disabled:opacity-40'

    const variants = {
      primary:
        'border-transparent bg-[var(--brand-violet)] text-[var(--brand-button-text)] hover:bg-[var(--brand-violet-hover)]',
      secondary:
        'border-theme-border bg-theme-base text-content-primary hover:border-theme-border-hover hover:bg-theme-elevated',
      ghost:
        'border-transparent text-content-muted hover:border-theme-border hover:bg-theme-elevated hover:text-content-primary',
      danger: 'border-red-600/30 bg-red-50 text-red-800 hover:bg-red-100',
    }

    const sizes = {
      sm: 'gap-1.5 px-2.5 py-1.5 text-xs',
      md: 'gap-2 px-3.5 py-2 text-[13px]',
      lg: 'gap-2 px-4 py-2.5 text-sm',
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
