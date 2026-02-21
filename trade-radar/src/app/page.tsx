"use client"

import React from 'react';
import { RadarCard } from '@/components/RadarCard';
import { useTradeRadar } from '@/hooks/useTradeRadar';
import { LayoutDashboard, Radio, RefreshCw, Compass, ShieldAlert } from 'lucide-react';

export default function Home() {
  const { signals, isLoading, lastUpdate, refresh } = useTradeRadar();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="min-h-screen cyber-grid pb-20">
      {/* Header Area */}
      <header className="border-b border-cyan-500/20 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-500/10 rounded-lg border border-cyan-500/50 flex items-center justify-center">
              <Compass className="text-cyan-400 animate-pulse-slow" size={24} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tighter flex items-center gap-2">
                ARC TRADE RADAR <span className="text-[10px] bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded border border-yellow-500/30">5MIN STRESS TEST</span>
              </h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">High Sensitivity Mode</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] text-gray-500 uppercase">Next Update</p>
              <p className="text-xs font-mono text-cyan-500">
                {mounted ? lastUpdate.toLocaleTimeString() : '--:--:--'}
              </p>
            </div>
            <button
              onClick={refresh}
              disabled={isLoading}
              className="w-10 h-10 rounded-full border border-gray-800 flex items-center justify-center hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={18} className={isLoading ? 'animate-spin text-cyan-400' : 'text-gray-400'} />
            </button>
          </div>
        </div>
      </header>

      {/* Hero / Alert Zone */}
      <section className="max-w-7xl mx-auto px-6 mt-10">
        <div className="glass-card rounded-2xl p-8 mb-10 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[80px] -translate-y-1/2 translate-x-1/2 rounded-full"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Rapid Market <span className="text-yellow-500">Scanning</span></h2>
              <p className="text-gray-400 max-w-xl text-sm leading-relaxed">
                Testing confluence efficiency in the 5-minute timeframe.
                Highly sensitive to noise, focused on immediate pattern validation.
              </p>
            </div>
            <div className="flex gap-4">
              <div className="bg-gray-900/50 border border-gray-800 p-4 rounded-xl text-center min-w-[120px]">
                <span className="block text-[10px] text-gray-500 uppercase mb-1">Timeframe</span>
                <span className="text-xl font-bold text-white">5 MINUTES</span>
              </div>
              <div className="bg-gray-900/50 border border-gray-800 p-4 rounded-xl text-center min-w-[120px]">
                <span className="block text-[10px] text-gray-500 uppercase mb-1">Status</span>
                <span className="text-xl font-bold text-green-500 flex items-center justify-center gap-2">
                  <Radio size={16} className="animate-pulse" /> LIVE
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Scanner Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading && signals.length === 0 ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-[200px] bg-gray-900/20 border border-gray-800 rounded-xl animate-pulse"></div>
            ))
          ) : (
            signals.map((signal) => (
              <RadarCard key={signal.symbol} signal={signal} />
            ))
          )}
        </div>
      </section>

      {/* Footer Info */}
      <footer className="max-w-7xl mx-auto px-6 mt-20 pt-10 border-t border-gray-800/50 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <ShieldAlert size={16} className="text-yellow-500" />
          <p className="text-[10px] text-gray-500 uppercase tracking-widest">Risk Management Protocol Engaged</p>
        </div>
        <p className="text-xs text-gray-600">
          © 2026 ARC Network • Quantitative Analysis & Prediction Systems
        </p>
      </footer>
    </main>
  );
}
