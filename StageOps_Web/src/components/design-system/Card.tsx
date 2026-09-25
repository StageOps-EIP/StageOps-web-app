import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
}

export function Card({ children, className = '', hover = false, onClick, ...props }: CardProps) {
  const interactive = hover || onClick;

  return (
    <div
      className={`glass-panel rounded-2xl p-4 sm:p-5 lg:p-6 ${
        interactive
          ? 'cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-400/25 hover:shadow-brand'
          : ''
      } ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function CardHeader({ title, subtitle, action }: CardHeaderProps) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h3 className="text-base font-semibold text-content-primary sm:text-lg">{title}</h3>
        {subtitle && <p className="mt-1 text-xs text-content-muted sm:text-sm">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
