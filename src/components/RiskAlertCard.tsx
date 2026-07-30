'use client';

import { AlertTriangle, Lightbulb, CheckCircle2, ChevronRight } from 'lucide-react';
import { RiskAlert, RiskSeverity } from '@/types';

interface RiskAlertCardProps {
  alert: RiskAlert;
  isActive: boolean;
  onClick: (clauseId: string | undefined) => void;
  index: number;
}

const SEVERITY_CONFIG: Record<RiskSeverity, {
  icon: React.FC<{ className?: string }>;
  label: string;
  cardBg: string;
  border: string;
  activeBorder: string;
  titleColor: string;
  iconColor: string;
  labelBg: string;
  labelText: string;
  glowClass: string;
}> = {
  critical: {
    icon: AlertTriangle,
    label: 'Critical Warning',
    cardBg: 'bg-red-950/30',
    border: 'border-red-800/40',
    activeBorder: 'border-red-500',
    titleColor: 'text-red-300',
    iconColor: 'text-red-400',
    labelBg: 'bg-red-500/15',
    labelText: 'text-red-400',
    glowClass: 'animate-pulse-glow-red',
  },
  recommendation: {
    icon: Lightbulb,
    label: 'Recommendation',
    cardBg: 'bg-amber-950/20',
    border: 'border-amber-800/30',
    activeBorder: 'border-amber-500',
    titleColor: 'text-amber-300',
    iconColor: 'text-amber-400',
    labelBg: 'bg-amber-500/15',
    labelText: 'text-amber-400',
    glowClass: 'animate-pulse-glow-amber',
  },
  pass: {
    icon: CheckCircle2,
    label: 'Compliance Pass',
    cardBg: 'bg-emerald-950/20',
    border: 'border-emerald-800/30',
    activeBorder: 'border-emerald-500',
    titleColor: 'text-emerald-300',
    iconColor: 'text-emerald-400',
    labelBg: 'bg-emerald-500/15',
    labelText: 'text-emerald-400',
    glowClass: 'animate-pulse-glow-emerald',
  },
};

export default function RiskAlertCard({ alert, isActive, onClick, index }: RiskAlertCardProps) {
  const config = SEVERITY_CONFIG[alert.severity];
  const Icon = config.icon;
  const hasLinkedClause = !!alert.relatedClauseId;

  return (
    <div
      onClick={() => hasLinkedClause && onClick(alert.relatedClauseId)}
      className={`
        rounded-xl border p-4 transition-all duration-300 ease-out
        animate-fade-in-up
        ${config.cardBg}
        ${isActive ? `${config.activeBorder} ${config.glowClass}` : config.border}
        ${hasLinkedClause ? 'cursor-pointer hover:scale-[1.01]' : ''}
      `}
      style={{ animationDelay: `${index * 120}ms` }}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 w-8 h-8 rounded-lg ${config.labelBg} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${config.iconColor}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${config.labelBg} ${config.labelText}`}>
              {config.label}
            </span>
            {hasLinkedClause && (
              <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
                클릭하여 조항 확인
                <ChevronRight className="w-3 h-3" />
              </span>
            )}
          </div>

          <h4 className={`text-xs font-semibold ${config.titleColor} leading-snug`}>
            {alert.title}
          </h4>
        </div>
      </div>

      {/* Description */}
      <p className="mt-2 text-xs text-slate-400 leading-relaxed pl-11">
        {alert.description}
      </p>

      {/* Action */}
      {alert.action && (
        <div className={`mt-2 ml-11 p-2.5 rounded-lg ${config.labelBg} border ${config.border}`}>
          <p className={`text-[11px] font-medium ${config.labelText} leading-snug`}>
            {alert.action}
          </p>
        </div>
      )}
    </div>
  );
}
