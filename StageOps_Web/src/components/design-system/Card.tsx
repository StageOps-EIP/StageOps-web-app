import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  hover?: boolean
}

export function Card({ children, className = '', hover = false, onClick, ...props }: CardProps) {
  const interactive = hover || onClick

  return (
    <div
      className={`panel p-4 sm:p-5 ${
        interactive
          ? 'cursor-pointer transition-colors duration-150 hover:border-theme-border-hover hover:bg-theme-elevated'
          : ''
      } ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
}

export function CardHeader({ title, subtitle, action }: CardHeaderProps) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h3 className="text-base font-semibold text-content-primary sm:text-lg">{title}</h3>
        {subtitle && <p className="mt-1 text-sm text-content-muted">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
