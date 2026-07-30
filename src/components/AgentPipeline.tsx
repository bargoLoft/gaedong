'use client';

import { useEffect } from 'react';
import { Cpu, ArrowRight } from 'lucide-react';
import { AgentInfo } from '@/types';
import AgentCard from './AgentCard';

interface AgentPipelineProps {
  agents: AgentInfo[];
  isComplete: boolean;
  onStart?: () => void;
  fileName: string;
}

export default function AgentPipeline({ agents, onStart, fileName }: AgentPipelineProps) {
  useEffect(() => {
    if (onStart) {
      const timer = setTimeout(onStart, 600);
      return () => clearTimeout(timer);
    }
  }, [onStart]);

  const completedCount = agents.filter(a => a.status === 'completed').length;
  const totalCount = agents.length;
  const overallProgress = (completedCount / totalCount) * 100;

  return (
    <div className="w-full max-w-xl mx-auto space-y-6 animate-fade-in-up">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 text-indigo-300 text-sm font-medium">
          <Cpu className="w-4 h-4 animate-spin" style={{ animationDuration: '3s' }} />
          멀티에이전트 분석 파이프라인 실행 중
        </div>
        <h2 className="text-xl font-bold text-white">
          AI가 문서를 분석하고 있습니다
        </h2>
        <p className="text-slate-400 text-sm">
          <span className="text-indigo-300 font-medium">{fileName}</span>
        </p>
      </div>

      {/* Overall progress */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span>전체 진행률</span>
          <span className="font-medium text-white">{completedCount}/{totalCount} 에이전트</span>
        </div>
        <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 transition-all duration-700 ease-out"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* Agent cards with connectors */}
      <div className="space-y-2">
        {agents.map((agent, index) => (
          <div key={agent.id}>
            <AgentCard agent={agent} index={index} />
            {index < agents.length - 1 && (
              <div className="flex justify-center my-1">
                <div className={`flex flex-col items-center gap-0.5 transition-all duration-300
                  ${agents[index].status === 'completed' ? 'text-emerald-500' : 'text-slate-700'}`}>
                  <div className="w-0.5 h-3 bg-current rounded-full" />
                  <ArrowRight className="w-3 h-3 rotate-90" />
                  <div className="w-0.5 h-3 bg-current rounded-full" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Info note */}
      <p className="text-center text-xs text-slate-600">
        에이전트가 순차적으로 실행됩니다. 완료 후 결과 대시보드로 자동 전환됩니다.
      </p>
    </div>
  );
}
