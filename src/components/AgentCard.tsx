'use client';

import { Check, Loader2 } from 'lucide-react';
import { AgentInfo, AgentStatusType } from '@/types';

interface AgentCardProps {
  agent: AgentInfo;
  index: number;
}

const COLOR_MAP: Record<string, { ring: string; bg: string; text: string; bar: string; glow: string }> = {
  blue: {
    ring: 'border-blue-500/60',
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    bar: 'bg-gradient-to-r from-blue-600 to-blue-400',
    glow: 'shadow-[0_0_20px_rgba(59,130,246,0.3)]',
  },
  purple: {
    ring: 'border-purple-500/60',
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    bar: 'bg-gradient-to-r from-purple-600 to-purple-400',
    glow: 'shadow-[0_0_20px_rgba(168,85,247,0.3)]',
  },
  red: {
    ring: 'border-red-500/60',
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    bar: 'bg-gradient-to-r from-red-600 to-red-400',
    glow: 'shadow-[0_0_20px_rgba(239,68,68,0.3)]',
  },
};

const STATUS_LABELS: Record<AgentStatusType, string> = {
  pending: '대기 중',
  running: '실행 중',
  completed: '완료',
};

export default function AgentCard({ agent, index }: AgentCardProps) {
  const colors = COLOR_MAP[agent.color] || COLOR_MAP.blue;
  const isRunning = agent.status === 'running';
  const isCompleted = agent.status === 'completed';
  const isPending = agent.status === 'pending';

  return (
    <div
      className={`
        glass-card p-5 transition-all duration-500 ease-out
        animate-fade-in-up
        ${isRunning ? `border-opacity-100 ${colors.ring} ${colors.glow}` : ''}
        ${isCompleted ? 'border-emerald-500/30' : ''}
        ${isPending ? 'opacity-50' : 'opacity-100'}
      `}
      style={{ animationDelay: `${index * 150}ms` }}
    >
      <div className="flex items-start gap-4">
        {/* Emoji + Status icon */}
        <div className={`relative flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl
          ${isRunning ? `${colors.bg} border ${colors.ring}` : isCompleted ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-slate-800'}`}>
          {isCompleted ? (
            <Check className="w-6 h-6 text-emerald-400 animate-bounce-in" />
          ) : (
            <span>{agent.emoji}</span>
          )}
          {isRunning && (
            <span className={`absolute inset-0 rounded-xl border ${colors.ring} animate-ping opacity-40`} />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className={`font-semibold text-sm ${isCompleted ? 'text-emerald-400' : isRunning ? colors.text : 'text-slate-400'}`}>
              {agent.name}
            </h3>
            <div className={`flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full
              ${isRunning ? `${colors.bg} ${colors.text}` : isCompleted ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
              {isRunning && <Loader2 className="w-3 h-3 animate-spin" />}
              {isCompleted && <Check className="w-3 h-3" />}
              {STATUS_LABELS[agent.status]}
            </div>
          </div>

          <p className={`text-xs leading-relaxed ${isRunning ? 'text-slate-300' : 'text-slate-500'}`}>
            {isRunning
              ? agent.runningDescription
              : isCompleted
                ? `${agent.runningDescription.replace('중...', '완료')}`
                : agent.description}
          </p>

          {/* Progress bar */}
          {isRunning && (
            <div className="mt-3 h-1 rounded-full bg-slate-800 overflow-hidden">
              <div className={`h-full rounded-full animate-progress-fill ${colors.bar}`} />
            </div>
          )}
          {isCompleted && (
            <div className="mt-3 h-1 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full rounded-full w-full bg-gradient-to-r from-emerald-600 to-emerald-400" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
