'use client';

import { ShieldCheck } from 'lucide-react';
import { RiskAlert } from '@/types';
import RiskAlertCard from './RiskAlertCard';

interface AuditPanelProps {
  alerts: RiskAlert[];
  complianceScore: number;
  highlightedClauseId: string | null;
  onHighlight: (clauseId: string | undefined) => void;
}

const SEVERITY_ORDER = ['critical', 'recommendation', 'pass'] as const;

function ComplianceScoreRing({ score }: { score: number }) {
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 90 ? '#10b981' : score >= 70 ? '#f59e0b' : '#ef4444';

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r={radius} fill="none" stroke="#1e293b" strokeWidth="6" />
          <circle
            cx="40" cy="40" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1.5s ease-out, stroke 0.5s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-white">{score}</span>
          <span className="text-[9px] text-slate-400">/100</span>
        </div>
      </div>
      <p className="text-[11px] text-slate-400 font-medium">Compliance Score</p>
    </div>
  );
}

export default function AuditPanel({ alerts, complianceScore, highlightedClauseId, onHighlight }: AuditPanelProps) {
  const sortedAlerts = [...alerts].sort(
    (a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity)
  );

  const criticalCount = alerts.filter(a => a.severity === 'critical').length;
  const recommendCount = alerts.filter(a => a.severity === 'recommendation').length;
  const passCount = alerts.filter(a => a.severity === 'pass').length;

  return (
    <div className="flex flex-col h-full space-y-4 animate-slide-in-right">
      {/* Panel header */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <ShieldCheck className="w-4 h-4 text-red-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">법적 감사 & 위험 분석</h3>
          <p className="text-[10px] text-slate-500">Audit Agent Output</p>
        </div>
      </div>

      {/* Score + stats row */}
      <div className="glass-card p-4 flex items-center gap-4">
        <ComplianceScoreRing score={complianceScore} />
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-red-400">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              Critical
            </span>
            <span className="font-bold text-white">{criticalCount}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              권장
            </span>
            <span className="font-bold text-white">{recommendCount}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              적합
            </span>
            <span className="font-bold text-white">{passCount}</span>
          </div>
        </div>
      </div>

      {/* Alert cards */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-0.5">
        {sortedAlerts.map((alert, index) => (
          <RiskAlertCard
            key={alert.id}
            alert={alert}
            isActive={highlightedClauseId === alert.relatedClauseId}
            onClick={onHighlight}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}
