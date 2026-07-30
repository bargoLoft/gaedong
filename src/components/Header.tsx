'use client';

import { Shield, Sparkles } from 'lucide-react';

export default function Header() {
  return (
    <header className="header-gradient sticky top-0 z-50 border-b border-white/5 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center shadow-lg">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-gray-900 animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">
                Con<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">Sentient</span>
              </h1>
              <p className="text-[10px] text-slate-400 leading-none font-medium tracking-wide">
                AI Privacy Compliance OS
              </p>
            </div>
          </div>

          {/* Center tagline — hidden on mobile */}
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Multi-Agent · PIPA Compliant · Non-Profit Ready</span>
          </div>

          {/* Status badge */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              System Online
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
