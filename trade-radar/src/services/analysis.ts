import { Candle } from './marketData';
import { calculateIndicators, IndicatorData } from './indicators';

export interface TradeSignal {
    symbol: string;
    type: 'LONG' | 'SHORT' | 'NEUTRAL';
    strength: number; // 0 to 100
    reason: string[];
    price: number;
    history: Candle[];
}

export function analyzeMarket(symbol: string, candles: Candle[]): TradeSignal {
    if (candles.length < 200) return { symbol, type: 'NEUTRAL', strength: 0, reason: ['Insufficient data'], price: 0, history: [] };

    const indicators = calculateIndicators(candles);
    const lastIdx = candles.length - 1;
    const lastPrice = candles[lastIdx].close;

    const lastEma9 = indicators.ema9[indicators.ema9.length - 1];
    const lastEma20 = indicators.ema20[indicators.ema20.length - 1];
    const lastEma200 = indicators.ema200[indicators.ema200.length - 1];
    const lastRsi = indicators.rsi[indicators.rsi.length - 1];
    const lastStoch = indicators.stochRSI[indicators.stochRSI.length - 1];

    let reasons: string[] = [];
    let score = 0;
    let type: 'LONG' | 'SHORT' | 'NEUTRAL' = 'NEUTRAL';

    // --- LONG RULES ---
    const isPriceAboveSupport = lastPrice > lastEma9 && lastPrice > lastEma20 && lastPrice > lastEma200;
    const isRsiOversoldLong = lastRsi < 30;
    const isStochOversoldLong = lastStoch.k < 20 || lastStoch.d < 20;

    // Bull Flag: Strong move up then at least 2 red candles
    // Added Volume Check: The "Pole" should have higher than average volume
    const avgVolume = candles.slice(-20).reduce((acc, c) => acc + c.volume, 0) / 20;
    const poleVolume = candles[lastIdx - 2].volume;
    const hasVolumeSurge = poleVolume > avgVolume * 1.5;

    const moveUp = ((candles[lastIdx - 2].close - candles[lastIdx - 7].close) / candles[lastIdx - 7].close) * 100;
    const lastTwoRed = candles[lastIdx].close < candles[lastIdx].open && candles[lastIdx - 1].close < candles[lastIdx - 1].open;
    const isBullFlag = moveUp > 1.5 && lastTwoRed && hasVolumeSurge;

    if (isBullFlag && isRsiOversoldLong && isStochOversoldLong && isPriceAboveSupport) {
        type = 'LONG';
        score = 90;
        reasons.push('Bull Flag with 2 Red Candles + Volume Surge');
        reasons.push('RSI < 30 (Oversold)');
        reasons.push('Stoch RSI < 20');
        reasons.push('Price using EMAs as Support');
    }

    // --- SHORT RULES ---
    const isPriceBelowResistance = lastPrice < lastEma9 && lastPrice < lastEma20 && lastPrice < lastEma200;
    const isRsiOverboughtShort = lastRsi > 70;
    const isStochOverboughtShort = lastStoch.k > 80 || lastStoch.d > 80;

    // Bear Flag: Strong move down then at least 2 green candles
    const moveDown = ((candles[lastIdx - 7].close - candles[lastIdx - 2].close) / candles[lastIdx - 7].close) * 100;
    const lastTwoGreen = candles[lastIdx].close > candles[lastIdx].open && candles[lastIdx - 1].close > candles[lastIdx - 1].open;
    const isBearFlag = moveDown > 1.5 && lastTwoGreen && hasVolumeSurge;

    if (isBearFlag && isRsiOverboughtShort && isStochOverboughtShort && isPriceBelowResistance) {
        type = 'SHORT';
        score = 90;
        reasons.push('Bear Flag with 2 Green Candles + Volume Surge');
        reasons.push('RSI > 70 (Overbought)');
        reasons.push('Stoch RSI > 80');
        reasons.push('Price using EMAs as Resistance');
    }

    // Default scoring if not full confluence but strong
    if (type === 'NEUTRAL') {
        if (isPriceAboveSupport && lastRsi < 40) {
            score = 50;
            reasons.push('Partial Confluence: Support + RSI Low');
        }
    }

    return {
        symbol,
        type,
        strength: score,
        reason: reasons,
        price: lastPrice,
        history: candles.slice(-50) // Last 50 candles for the mini-chart
    };
}
