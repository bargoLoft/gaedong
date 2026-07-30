'use client';

import { Check, Upload, Cpu, LayoutDashboard } from 'lucide-react';
import { AppStep } from '@/types';

interface StepIndicatorProps {
  currentStep: AppStep;
}

const STEPS = [
  { id: 1 as AppStep, label: '문서 업로드', icon: Upload },
  { id: 2 as AppStep, label: '에이전트 분석', icon: Cpu },
  { id: 3 as AppStep, label: '결과 대시보드', icon: LayoutDashboard },
];

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="w-full max-w-2xl mx-auto no-print">
      <div className="flex items-center justify-center">
        {STEPS.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;
          const Icon = step.icon;

          return (
            <div key={step.id} className="flex items-center">
              {/* Step node */}
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`
                    relative w-10 h-10 rounded-full flex items-center justify-center
                    transition-all duration-500 ease-out
                    ${isCompleted
                      ? 'bg-emerald-500 shadow-[0_0_16px_rgba(16,185,129,0.5)]'
                      : isActive
                        ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-[0_0_16px_rgba(99,102,241,0.5)]'
                        : 'bg-slate-800 border border-slate-700'
                    }
                  `}
                >
                  {isCompleted ? (
                    <Check className="w-4.5 h-4.5 text-white animate-bounce-in" />
                  ) : (
                    <Icon
                      className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`}
                    />
                  )}
                  {isActive && (
                    <span className="absolute inset-0 rounded-full border-2 border-indigo-400 animate-ping opacity-60" />
                  )}
                </div>
                <div className="text-center">
                  <p
                    className={`text-xs font-semibold leading-tight ${
                      isActive
                        ? 'text-white'
                        : isCompleted
                          ? 'text-emerald-400'
                          : 'text-slate-500'
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
              </div>

              {/* Connector line */}
              {index < STEPS.length - 1 && (
                <div className="w-16 sm:w-24 h-[2px] mx-3 mb-7 relative overflow-hidden rounded-full bg-slate-800">
                  <div
                    className={`
                      h-full rounded-full transition-all duration-700 ease-out
                      ${currentStep > step.id
                        ? 'w-full bg-gradient-to-r from-emerald-500 to-emerald-400'
                        : 'w-0 bg-indigo-500'
                      }
                    `}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
