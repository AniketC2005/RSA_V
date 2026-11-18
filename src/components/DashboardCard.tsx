import React, { ReactNode } from 'react';

interface DashboardCardProps {
  title: string;
  subtitle?: string;
  icon?: React.ElementType;
  badge?: string;
  badgeColor?: 'cyan' | 'emerald' | 'amber' | 'slate';
  headerAction?: ReactNode;
  children: ReactNode;
  className?: string;
  glow?: boolean;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  subtitle,
  icon: Icon,
  badge,
  badgeColor = 'cyan',
  headerAction,
  children,
  className = '',
  glow = false,
}) => {
  const badgeClasses = {
    cyan: 'bg-lab-accent/10 text-lab-accent border-lab-accent/30',
    emerald: 'bg-lab-emerald/10 text-lab-emerald border-lab-emerald/30',
    amber: 'bg-lab-amber/10 text-lab-amber border-lab-amber/30',
    slate: 'bg-lab-border/40 text-lab-muted border-lab-border',
  };

  return (
    <div
      className={`relative bg-lab-card rounded-2xl border border-lab-border p-5 transition-all duration-200 ${
        glow ? 'border-lab-accent/30 shadow-cyan-glow' : 'hover:border-lab-borderLight'
      } ${className}`}
    >
      <div className="flex items-start justify-between mb-4 pb-3 border-b border-lab-border/60">
        <div className="flex items-center space-x-3">
          {Icon && (
            <div className="p-2 rounded-xl bg-lab-secondary border border-lab-border text-lab-accent">
              <Icon className="w-5 h-5" />
            </div>
          )}
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-lab-text tracking-wide text-sm sm:text-base">
                {title}
              </h3>
              {badge && (
                <span
                  className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border font-semibold ${badgeClasses[badgeColor]}`}
                >
                  {badge}
                </span>
              )}
            </div>
            {subtitle && <p className="text-xs text-lab-muted mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {headerAction && <div className="flex items-center space-x-2">{headerAction}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
};
