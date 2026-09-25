import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
}

export function Card({ children, className = '', hover = false, onClick, ...props }: CardProps) {
  const interactive = hover || onClick;

  return (
    <div
      className={`tech-panel p-4 sm:p-5 lg:p-6 ${
        interactive ? 'cursor-pointer transition-all duration-200 hover:border-cyan-400/40 hover:bg-theme-elevated' : ''
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
    <div className="mb-5 flex items-start justify-between gap-4 border-b border-theme-border pb-4">
      <div className="min-w-0">
        <p className="control-label mb-1.5 text-content-faint">Module</p>
        <h3 className="text-lg font-medium text-content-primary sm:text-xl">{title}</h3>
        {subtitle && <p className="mt-1 text-xs text-content-muted">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
