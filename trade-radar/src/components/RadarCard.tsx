import React from 'react';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle2 } from 'lucide-react';
import { TradeSignal } from '../services/analysis';
import { MiniChart } from './MiniChart';

interface RadarCardProps {
    signal: TradeSignal;
    isLoading?: boolean;
}

export const RadarCard: React.FC<RadarCardProps> = ({ signal, isLoading }) => {
    const isLong = signal.type === 'LONG';
    const isShort = signal.type === 'SHORT';
    const isNeutral = signal.type === 'NEUTRAL';

    const chartColor = isLong ? '#22c55e' : isShort ? '#ef4444' : '#64748b';

    return (
        <div className={`p-4 rounded-xl border transition-all flex flex-col gap-4 ${isLong ? 'bg-green-500/10 border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.1)]' :
            isShort ? 'bg-red-500/10 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.1)]' :
                'bg-gray-900/50 border-gray-800'
            }`}>
            <div className="flex justify-between items-center">
                <div className="flex flex-col">
                    <span className="text-xl font-bold text-white">{signal.symbol}</span>
                    <span className="text-xs text-gray-500">${signal.price.toLocaleString()}</span>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${isLong ? 'bg-green-500 text-black' :
                    isShort ? 'bg-red-500 text-white' :
                        'bg-gray-800 text-gray-400'
                    }`}>
                    {isLong && <TrendingUp size={14} />}
                    {isShort && <TrendingDown size={14} />}
                    {signal.type}
                </div>
            </div>

            {/* Mini Chart Area */}
            <div className="h-20 bg-black/20 rounded-lg overflow-hidden border border-white/5">
                <MiniChart data={signal.history} color={chartColor} />
            </div>

            <div className="space-y-2">
                <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Signal Strength</span>
                    <span className={isLong ? 'text-green-400' : isShort ? 'text-red-400' : 'text-gray-500'}>
                        {signal.strength}%
                    </span>
                </div>
                <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-500 ${isLong ? 'bg-green-500' : isShort ? 'bg-red-500' : 'bg-gray-600'}`}
                        style={{ width: `${signal.strength}%` }}
                    />
                </div>
            </div>

            {signal.reason.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-800/50">
                    <h4 className="text-[10px] uppercase font-bold text-gray-500 mb-2">Confluence Rules</h4>
                    <ul className="space-y-1">
                        {signal.reason.map((r, i) => (
                            <li key={i} className="text-[10px] text-gray-300 flex items-center gap-1.5">
                                <CheckCircle2 size={10} className="text-cyan-500" /> {r}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};
