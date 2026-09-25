import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  hover?: boolean
}

export function Card({ children, className = '', hover = false, onClick, ...props }: CardProps) {
  const interactive = hover || onClick

  return (
    <div
      className={`work-panel p-4 sm:p-5 ${
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
    <div className="mb-4 flex items-start justify-between gap-4 border-b border-theme-border pb-3">
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-content-primary">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-content-muted">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
