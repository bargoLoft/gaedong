'use client';

import { useState, useCallback } from 'react';
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

  const handleSimulationComplete = useCallback(() => {
    // Brief delay so last agent "completed" state is visible
    setTimeout(() => setCurrentStep(3), 400);
  }, []);

  const { agents, isComplete, startSimulation, reset } = useAgentSimulation(handleSimulationComplete);

  const handleStartAnalysis = useCallback(() => {
    reset();
    setCurrentStep(2);
  }, [reset]);

  const handleReset = useCallback(() => {
    reset();
    setCurrentStep(1);
    setHighlightedClauseId(null);
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
          <div className="flex justify-center">
            <AgentPipeline
              agents={agents}
              isComplete={isComplete}
              onStart={startSimulation}
              fileName={MOCK_DATASET.fileName}
            />
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
              data={MOCK_DATASET}
              highlightedClauseId={highlightedClauseId}
              onHighlight={handleHighlight}
            />
          </>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-6 text-center no-print">
        <p className="text-xs text-slate-600">
          ConSentient © 2024 · AI-generated drafts require legal review before official use ·{' '}
          <span className="text-slate-500">개인정보보호법 준수 지원 도구</span>
        </p>
      </footer>
    </div>
  );
}
