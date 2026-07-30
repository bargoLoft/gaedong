'use client';

import { useState, useCallback, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';

import Header from '@/components/Header';
import StepIndicator from '@/components/StepIndicator';
import FileUpload from '@/components/FileUpload';
import AgentPipeline from '@/components/AgentPipeline';
import Dashboard from '@/components/Dashboard';

import { useAgentSimulation } from '@/hooks/useAgentSimulation';
import { MOCK_DATASET } from '@/data/mockData';
import { AppStep } from '@/types';

export default function HomePage() {
  const [currentStep, setCurrentStep] = useState<AppStep>(1);
  const [highlightedClauseId, setHighlightedClauseId] = useState<string | null>(null);

  const [dataset, setDataset] = useState(MOCK_DATASET);
  const [apiError, setApiError] = useState<string | null>(null);

  const { agents, isComplete, setAgentStatus, reset } = useAgentSimulation();

  const handleStartAnalysis = useCallback(async (useSample: boolean, file: File | null) => {
    reset();
    setCurrentStep(2);
    setApiError(null);

    const fileName = useSample ? '2024_복지급여_신청서_김복순.pdf (샘플)' : (file?.name || '문서');

    try {
      // ── Step 1: Extract Agent ──
      setAgentStatus('extract', 'running');
      const formData = new FormData();
      if (file) formData.append('file', file);
      formData.append('useSample', String(useSample));
      formData.append('step', 'extract');

      const res1 = await fetch('/api/analyze', { method: 'POST', body: formData });
      const data1 = await res1.json();
      if (!data1.success) throw new Error(data1.error || '추출 에이전트 분석 중 오류가 발생했습니다.');

      setAgentStatus('extract', 'completed');

      // ── Step 2: Generation Agent ──
      setAgentStatus('generation', 'running');
      const res2 = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: 'generate', extractText: data1.extractText }),
      });
      const data2 = await res2.json();
      if (!data2.success) throw new Error(data2.error || '생성 에이전트 분석 중 오류가 발생했습니다.');

      setAgentStatus('generation', 'completed');

      // ── Step 3: Audit Agent ──
      setAgentStatus('audit', 'running');
      const res3 = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 'audit',
          extractText: data1.extractText,
          generationText: data2.generationText,
        }),
      });
      const data3 = await res3.json();
      if (!data3.success) throw new Error(data3.error || '감사 에이전트 분석 중 오류가 발생했습니다.');

      setAgentStatus('audit', 'completed');

      setDataset({
        fileName,
        extractedItems: data1.items || [],
        consentClauses: data2.clauses || [],
        riskAlerts: data3.alerts || [],
        complianceScore: data3.complianceScore || 75,
      });

      // 3개 에이전트 완료 상태를 0.5초간 보여준 후 대시보드 전환
      setTimeout(() => setCurrentStep(3), 500);

    } catch (e) {
      console.error(e);
      setApiError(e instanceof Error ? e.message : '네트워크 또는 서버 오류가 발생했습니다.');
    }
  }, [reset, setAgentStatus]);

  const handleReset = useCallback(() => {
    reset();
    setCurrentStep(1);
    setHighlightedClauseId(null);
    setDataset(MOCK_DATASET);
    setApiError(null);
  }, [reset]);

  const handleHighlight = useCallback((clauseId: string | undefined) => {
    setHighlightedClauseId(prev => (prev === clauseId ? null : (clauseId ?? null)));
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* ── Header ── */}
      <Header />

      {/* ── Main content ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">

        {/* Step indicator */}
        {currentStep !== 3 && (
          <StepIndicator currentStep={currentStep} />
        )}

        {/* ── Step 1: File Upload ── */}
        {currentStep === 1 && (
          <div className="flex justify-center">
            <FileUpload onStart={handleStartAnalysis} />
          </div>
        )}

        {/* ── Step 2: Agent Pipeline ── */}
        {currentStep === 2 && (
          <div className="flex flex-col items-center justify-center space-y-4">
            <AgentPipeline
              agents={agents}
              isComplete={isComplete}
              fileName={dataset.fileName}
            />
            {apiError && (
              <div className="w-full max-w-xl mx-auto p-4 mt-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-sm text-center">
                <p className="font-bold mb-1">🚨 AI 분석 실패</p>
                <p className="break-words">{apiError}</p>
                <button 
                  onClick={handleReset}
                  className="mt-3 px-4 py-1.5 rounded-full border border-red-500/30 hover:bg-red-500/20 transition-colors"
                >
                  돌아가기
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Step 3: Dashboard ── */}
        {currentStep === 3 && (
          <>
            {/* Top bar with step indicator + reset */}
            <div className="flex items-center justify-between flex-wrap gap-4 no-print">
              <StepIndicator currentStep={3} />
              <button
                id="reset-btn"
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-700
                           bg-slate-900/60 text-sm text-slate-400 hover:text-white hover:border-slate-600
                           transition-all duration-200 flex-shrink-0"
              >
                <RotateCcw className="w-4 h-4" />
                처음으로
              </button>
            </div>

            <Dashboard
              data={dataset}
              highlightedClauseId={highlightedClauseId}
              onHighlight={handleHighlight}
            />
          </>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-6 text-center no-print">
        <p className="text-xs text-slate-600">
          개동췤 © 2026 · AI 생성 초안은 실제 사용 전 법무 검토가 필요합니다 ·{' '}
          <span className="text-slate-500">개인정보보호법 준수 지원 도구</span>
        </p>
      </footer>
    </div>
  );
}
