'use client';

import { Database, Tag } from 'lucide-react';
import { ExtractedItem, DataCategory } from '@/types';

interface ExtractPanelProps {
  items: ExtractedItem[];
  highlightedClauseId?: string | null;
}

const CATEGORY_CONFIG: Record<DataCategory, {
  label: string;
  sublabel: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  dotColor: string;
  headerBg: string;
}> = {
  general: {
    label: '일반 개인정보',
    sublabel: 'General Data',
    badgeBg: 'bg-blue-500/15',
    badgeText: 'text-blue-300',
    borderColor: 'border-blue-500/20',
    dotColor: 'bg-blue-400',
    headerBg: 'from-blue-500/10 to-transparent',
  },
  sensitive: {
    label: '민감정보',
    sublabel: 'Sensitive Data',
    badgeBg: 'bg-orange-500/15',
    badgeText: 'text-orange-300',
    borderColor: 'border-orange-500/20',
    dotColor: 'bg-orange-400',
    headerBg: 'from-orange-500/10 to-transparent',
  },
  unique_id: {
    label: '고유식별정보',
    sublabel: 'Unique Identifier',
    badgeBg: 'bg-red-500/15',
    badgeText: 'text-red-300',
    borderColor: 'border-red-500/20',
    dotColor: 'bg-red-400',
    headerBg: 'from-red-500/10 to-transparent',
  },
};

const CATEGORY_ORDER: DataCategory[] = ['general', 'sensitive', 'unique_id'];

export default function ExtractPanel({ items }: ExtractPanelProps) {
  const grouped = CATEGORY_ORDER.reduce<Record<DataCategory, ExtractedItem[]>>(
    (acc, cat) => {
      acc[cat] = items.filter(i => i.category === cat);
      return acc;
    },
    { general: [], sensitive: [], unique_id: [] }
  );

  return (
    <div className="flex flex-col h-full space-y-4 animate-slide-in-left">
      {/* Panel header */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
          <Database className="w-4 h-4 text-blue-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">추출 데이터 & 스마트 태깅</h3>
          <p className="text-[10px] text-slate-500">Extract Agent Output</p>
        </div>
        <div className="ml-auto text-xs text-slate-500 bg-slate-800 px-2.5 py-1 rounded-full">
          총 {items.length}개 항목
        </div>
      </div>

      {/* Category groups */}
      <div className="space-y-3 flex-1 overflow-y-auto pr-0.5">
        {CATEGORY_ORDER.map((cat) => {
          const config = CATEGORY_CONFIG[cat];
          const catItems = grouped[cat];
          if (catItems.length === 0) return null;

          return (
            <div
              key={cat}
              className={`rounded-xl border ${config.borderColor} overflow-hidden`}
            >
              {/* Category header */}
              <div className={`bg-gradient-to-r ${config.headerBg} px-3 py-2 flex items-center gap-2`}>
                <span className={`w-2 h-2 rounded-full ${config.dotColor}`} />
                <span className={`text-xs font-semibold ${config.badgeText}`}>
                  {config.label}
                </span>
                <span className="text-[10px] text-slate-500 ml-0.5">({config.sublabel})</span>
                <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-full ${config.badgeBg} ${config.badgeText} font-medium`}>
                  {catItems.length}
                </span>
              </div>

              {/* Items */}
              <div className="divide-y divide-white/5">
                {catItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className="px-3 py-2.5 flex items-start gap-2.5 group hover:bg-white/3 transition-colors"
                    style={{ animationDelay: `${idx * 80}ms` }}
                  >
                    <Tag className={`w-3 h-3 mt-0.5 flex-shrink-0 ${config.badgeText} opacity-60`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-medium text-slate-400 flex-shrink-0">
                          {item.label}
                        </span>
                        <span className={`text-xs font-medium ${config.badgeText}`}>
                          {item.value}
                        </span>
                      </div>
                    </div>
                    <span className={`flex-shrink-0 text-[9px] px-1.5 py-0.5 rounded ${config.badgeBg} ${config.badgeText} font-medium`}>
                      {cat === 'general' ? 'G' : cat === 'sensitive' ? 'S' : 'U'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 pt-1">
        {CATEGORY_ORDER.map(cat => {
          const config = CATEGORY_CONFIG[cat];
          return (
            <div key={cat} className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${config.badgeBg} border ${config.borderColor}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
              <span className={`text-[10px] font-medium ${config.badgeText}`}>{config.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
