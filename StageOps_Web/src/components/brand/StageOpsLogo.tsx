interface StageOpsLogoProps {
  compact?: boolean;
  className?: string;
  inverse?: boolean;
}

export function StageOpsLogo({ compact = false, className = '', inverse = false }: StageOpsLogoProps) {
  return (
    <div
      className={`stageops-logo ${compact ? 'stageops-logo--compact' : ''} ${className}`.trim()}
      role="img"
      aria-label="StageOps"
    >
      <span className="stageops-logo__mark" aria-hidden="true">
        <img src="/brand/stageops-rideau.svg" alt="" />
      </span>
      {!compact && (
        <span className="stageops-logo__wordmark" aria-hidden="true">
          <span className={inverse ? 'text-white' : 'text-content-primary'}>Stage</span>
          <span className="stageops-logo__accent">Ops</span>
        </span>
      )}
    </div>
  );
}
