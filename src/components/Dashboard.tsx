'use client';

import { MockDataSet } from '@/types';
import ExtractPanel from './ExtractPanel';
import ConsentDraft from './ConsentDraft';
import AuditPanel from './AuditPanel';
import ExportActions from './ExportActions';

interface DashboardProps {
  data: MockDataSet;
  highlightedClauseId: string | null;
  onHighlight: (clauseId: string | undefined) => void;
}

export default function Dashboard({ data, highlightedClauseId, onHighlight }: DashboardProps) {
  return (
    <div className="w-full space-y-5 animate-fade-in-up">
      {/* Results header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">분석 결과 대시보드</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            3개 에이전트 분석 완료 ·{' '}
            <span className="text-indigo-300">{data.fileName}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-xs text-emerald-400 font-medium">분석 완료</span>
        </div>
      </div>

      {/* 3-column dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Section A — Extract */}
        <div className="glass-card p-5 flex flex-col min-h-[520px]">
          <ExtractPanel
            items={data.extractedItems}
            highlightedClauseId={highlightedClauseId}
          />
        </div>

        {/* Section B — Consent Draft (wider on larger screens) */}
        <div className="glass-card p-5 flex flex-col min-h-[520px] lg:min-h-[620px]">
          <ConsentDraft
            clauses={data.consentClauses}
            highlightedClauseId={highlightedClauseId}
          />
        </div>

        {/* Section C — Audit */}
        <div className="glass-card p-5 flex flex-col min-h-[520px]">
          <AuditPanel
            alerts={data.riskAlerts}
            complianceScore={data.complianceScore}
            highlightedClauseId={highlightedClauseId}
            onHighlight={onHighlight}
          />
        </div>
      </div>

      {/* Export actions */}
      <ExportActions clauses={data.consentClauses} fileName={data.fileName} />
    </div>
  );
}
