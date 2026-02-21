import { useState, useEffect, useCallback } from 'react';
import { fetchKlines, Candle } from '../services/marketData';
import { analyzeMarket, TradeSignal } from '../services/analysis';

const SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'LINKUSDT', 'DOTUSDT'];

export function useTradeRadar() {
    const [signals, setSignals] = useState<TradeSignal[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

    const playAlert = useCallback(() => {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.volume = 0.5;
        audio.play().catch(e => console.log('Audio play failed:', e));
    }, []);

    const updateSignals = useCallback(async () => {
        setIsLoading(true);
        const newSignals = await Promise.all(
            SYMBOLS.map(async (symbol) => {
                const klines = await fetchKlines(symbol, '5m', 250);
                return analyzeMarket(symbol, klines);
            })
        );

        // Check for new High Strength Signals to play alert
        const hasStrongSignal = newSignals.some(s => s.strength >= 80 && (s.type === 'LONG' || s.type === 'SHORT'));
        if (hasStrongSignal) {
            playAlert();
        }

        setSignals(newSignals);
        setLastUpdate(new Date());
        setIsLoading(false);
    }, [playAlert]);

    useEffect(() => {
        updateSignals();
        const interval = setInterval(updateSignals, 1000 * 60 * 5); // Update every 5 mins
        return () => clearInterval(interval);
    }, [updateSignals]);

    return { signals, isLoading, lastUpdate, refresh: updateSignals };
}
