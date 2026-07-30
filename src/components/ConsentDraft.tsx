'use client';

import { useEffect, useRef } from 'react';
import { FileText, AlertTriangle } from 'lucide-react';
import { ConsentClause } from '@/types';

interface ConsentDraftProps {
  clauses: ConsentClause[];
  highlightedClauseId: string | null;
}

export default function ConsentDraft({ clauses, highlightedClauseId }: ConsentDraftProps) {
  const clauseRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Scroll to and highlight target clause
  useEffect(() => {
    if (!highlightedClauseId) return;
    const el = clauseRefs.current[highlightedClauseId];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.remove('animate-highlight-pulse');
      void el.offsetWidth; // reflow trick to restart animation
      el.classList.add('animate-highlight-pulse');
      const cleanup = setTimeout(() => {
        el.classList.remove('animate-highlight-pulse');
      }, 5000);
      return () => clearTimeout(cleanup);
    }
  }, [highlightedClauseId]);

  return (
    <div className="flex flex-col h-full space-y-4 animate-fade-in">
      {/* Panel header */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
          <FileText className="w-4 h-4 text-purple-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">생성된 동의서 초안</h3>
          <p className="text-[10px] text-slate-500">생성 에이전트 결과</p>
        </div>
      </div>

      {/* Document viewer */}
      <div
        id="consent-draft-print"
        className="flex-1 overflow-y-auto rounded-xl border border-slate-700/50 bg-white shadow-xl"
      >
        {/* Document title */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-200">
          <div className="text-center space-y-1">
            <h2 className="text-lg font-bold text-slate-800 consent-document">
              개인정보 수집·이용 동의서
            </h2>
            <p className="text-xs text-slate-500">개인정보 수집·이용 동의서</p>
            <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-[10px] text-indigo-600 font-medium">
              <AlertTriangle className="w-3 h-3" />
              AI 생성 초안 — 법무 검토 필요
            </div>
          </div>
        </div>

        {/* Clauses */}
        <div className="px-6 py-4 space-y-4 consent-document">
          {clauses.map((clause) => (
            <div
              key={clause.id}
              ref={(el) => { clauseRefs.current[clause.id] = el; }}
              id={`clause-${clause.id}`}
              className={`
                rounded-lg p-4 transition-all duration-300
                ${clause.isSensitiveBox
                  ? 'border-2 border-orange-300 bg-orange-50'
                  : clause.isLegalRepBox
                    ? 'border-2 border-blue-300 bg-blue-50'
                    : 'border border-slate-100 bg-slate-50/50'
                }
                ${highlightedClauseId === clause.id ? 'ring-2 ring-indigo-400 ring-offset-1' : ''}
              `}
            >
              {/* Clause title */}
              <h3 className={`text-sm font-bold mb-2 ${
                clause.isSensitiveBox
                  ? 'text-orange-700'
                  : clause.isLegalRepBox
                    ? 'text-blue-700'
                    : 'text-slate-800'
              }`}>
                {clause.title}
              </h3>

              {/* Clause content */}
              <div className="text-xs leading-relaxed text-slate-700 whitespace-pre-line">
                {clause.content}
              </div>

              {/* Signature line for special boxes */}
              {clause.isSensitiveBox && (
                <div className="mt-3 pt-3 border-t border-orange-200 flex items-center justify-between text-xs">
                  <span className="text-orange-700 font-medium">서명</span>
                  <div className="flex-1 mx-4 border-b border-orange-300" />
                  <span className="text-orange-600">_____ 년 _____ 월 _____ 일</span>
                </div>
              )}
              {clause.isLegalRepBox && (
                <div className="mt-3 pt-3 border-t border-blue-200 flex items-center justify-between text-xs">
                  <span className="text-blue-700 font-medium">법정대리인 서명</span>
                  <div className="flex-1 mx-4 border-b border-blue-300" />
                  <span className="text-blue-600">_____ 년 _____ 월 _____ 일</span>
                </div>
              )}
            </div>
          ))}

          {/* Footer */}
          <div className="pt-4 border-t border-slate-200 text-center space-y-2">
            <p className="text-[11px] text-slate-500">
              위의 개인정보 수집·이용에 동의합니까?
            </p>
            <div className="flex justify-center gap-6 text-sm text-slate-700 font-medium">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="consent" className="accent-indigo-600" />
                예, 동의합니다
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="consent" className="accent-red-500" />
                아니오, 동의하지 않습니다
              </label>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
              <span>성명: _________________</span>
              <span>서명/날인: _____________</span>
              <span>날짜: _____ 년 _____ 월 _____ 일</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
