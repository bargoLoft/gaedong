'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, FileText, Sparkles, ArrowRight, X, CheckCircle2 } from 'lucide-react';

interface FileUploadProps {
  onStart: (useSample: boolean) => void;
}

export default function FileUpload({ onStart }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [usingSample, setUsingSample] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      setUploadedFile(file);
      setUsingSample(false);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setUsingSample(false);
    }
  }, []);

  const handleSampleLoad = useCallback(() => {
    setUploadedFile(null);
    setUsingSample(true);
  }, []);

  const handleClear = useCallback(() => {
    setUploadedFile(null);
    setUsingSample(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const isReady = uploadedFile !== null || usingSample;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-fade-in-up">
      {/* Hero text */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          Multi-Agent AI Pipeline
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
          복지 신청서에서{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">
            개인정보 동의서
          </span>
          까지
        </h2>
        <p className="text-slate-400 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
          복지급여 신청 PDF를 업로드하면 3개의 AI 에이전트가 자동으로 개인정보보호법 준수
          동의서를 생성하고 법적 위험을 감사합니다.
        </p>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isReady && fileInputRef.current?.click()}
        className={`
          relative rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center cursor-pointer
          transition-all duration-300 ease-out
          ${isDragging
            ? 'border-indigo-400 bg-indigo-500/10 scale-[1.01]'
            : isReady
              ? 'border-emerald-500/60 bg-emerald-500/5 cursor-default'
              : 'border-slate-700 bg-slate-900/40 hover:border-slate-600 hover:bg-slate-900/60'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleFileSelect}
        />

        {isReady ? (
          /* Loaded state */
          <div className="flex flex-col items-center gap-3 animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <p className="font-semibold text-white">
                {usingSample ? '샘플 복지 신청서 준비됨' : uploadedFile?.name}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {usingSample
                  ? '2024_복지급여_신청서_김복순.pdf (샘플)'
                  : `${((uploadedFile?.size ?? 0) / 1024).toFixed(1)} KB`}
              </p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); handleClear(); }}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-400 transition-colors mt-1"
            >
              <X className="w-3.5 h-3.5" />
              제거
            </button>
          </div>
        ) : (
          /* Upload state */
          <div className="flex flex-col items-center gap-4">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300
              ${isDragging ? 'bg-indigo-500/20 scale-110' : 'bg-slate-800'}`}
            >
              <Upload
                className={`w-8 h-8 transition-colors ${isDragging ? 'text-indigo-400' : 'text-slate-500'}`}
              />
            </div>
            <div>
              <p className="text-slate-300 font-medium">
                {isDragging ? 'PDF를 놓아서 업로드' : 'PDF 파일을 드래그하거나 클릭하여 업로드'}
              </p>
              <p className="text-slate-500 text-xs mt-1">복지급여 신청서, 기초생활 수급 신청서 등</p>
            </div>
          </div>
        )}
      </div>

      {/* Sample button */}
      {!isReady && (
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-slate-800" />
          <button
            onClick={handleSampleLoad}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-700 bg-slate-900/50
                       text-sm text-slate-300 hover:border-indigo-500/50 hover:text-indigo-300
                       hover:bg-indigo-500/5 transition-all duration-200"
          >
            <FileText className="w-4 h-4" />
            샘플 복지 신청서로 테스트
          </button>
          <div className="flex-1 h-px bg-slate-800" />
        </div>
      )}

      {/* Start button */}
      {isReady && (
        <button
          id="start-analysis-btn"
          onClick={() => onStart(usingSample)}
          className="btn-primary w-full flex items-center justify-center gap-3 py-4 rounded-2xl
                     text-white font-semibold text-base shadow-xl"
        >
          <span className="relative z-10 flex items-center gap-3">
            <Sparkles className="w-5 h-5" />
            멀티에이전트 분석 시작
            <ArrowRight className="w-5 h-5" />
          </span>
        </button>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 pt-2">
        {[
          { label: '처리 시간', value: '< 8초', icon: '⚡' },
          { label: '법적 조항 검토', value: '4가지', icon: '⚖️' },
          { label: '위험 항목 감사', value: '자동', icon: '🛡️' },
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-3 text-center">
            <div className="text-lg mb-0.5">{stat.icon}</div>
            <div className="text-sm font-bold text-white">{stat.value}</div>
            <div className="text-[10px] text-slate-500">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
