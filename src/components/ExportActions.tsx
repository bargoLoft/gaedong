'use client';

import { useState, useCallback } from 'react';
import { Download, Copy, Check, Printer } from 'lucide-react';
import { ConsentClause } from '@/types';

interface ExportActionsProps {
  clauses: ConsentClause[];
  fileName: string;
}

export default function ExportActions({ clauses, fileName }: ExportActionsProps) {
  const [copied, setCopied] = useState(false);

  const getDraftText = useCallback(() => {
    const lines = [
      '══════════════════════════════════════════',
      '     개인정보 수집·이용 동의서',
      '══════════════════════════════════════════',
      `원본 파일: ${fileName}`,
      `생성일시: ${new Date().toLocaleString('ko-KR')}`,
      '',
      ...clauses.flatMap(clause => [
        '',
        `【${clause.title}】`,
        clause.content,
      ]),
      '',
      '══════════════════════════════════════════',
      '이 문서는 ConSentient AI에 의해 생성된 초안입니다.',
      '실제 사용 전 법무 담당자의 검토가 필요합니다.',
    ];
    return lines.join('\n');
  }, [clauses, fileName]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(getDraftText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback for non-secure context
      const el = document.createElement('textarea');
      el.value = getDraftText();
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }, [getDraftText]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 glass-card no-print">
      <div>
        <p className="text-sm font-semibold text-white">동의서 초안 내보내기</p>
        <p className="text-xs text-slate-500 mt-0.5">
          PDF 출력 또는 텍스트 복사 후 검토하세요
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Copy button */}
        <button
          id="copy-draft-btn"
          onClick={handleCopy}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200
            ${copied
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600 hover:text-white'
            }`}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              복사 완료!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              텍스트 복사
            </>
          )}
        </button>

        {/* Print/PDF button */}
        <button
          id="export-pdf-btn"
          onClick={handlePrint}
          className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
        >
          <span className="relative z-10 flex items-center gap-2">
            <Printer className="w-4 h-4" />
            PDF 내보내기
            <Download className="w-3.5 h-3.5" />
          </span>
        </button>
      </div>
    </div>
  );
}
