import { EMA, RSI, StochasticRSI } from 'technicalindicators';
import { Candle } from './marketData';

export interface IndicatorData {
    ema9: number[];
    ema20: number[];
    ema200: number[];
    rsi: number[];
    stochRSI: { k: number, d: number }[];
}

export function calculateIndicators(candles: Candle[]): IndicatorData {
    const closes = candles.map(c => c.close);

    const ema9 = EMA.calculate({ period: 9, values: closes });
    const ema20 = EMA.calculate({ period: 20, values: closes });
    const ema200 = EMA.calculate({ period: 200, values: closes });

    const rsi = RSI.calculate({ period: 14, values: closes });

    const stochRSI = StochasticRSI.calculate({
        values: closes,
        rsiPeriod: 14,
        stochasticPeriod: 14,
        kPeriod: 3,
        dPeriod: 3,
    });

    return {
        ema9,
        ema20,
        ema200,
        rsi,
        stochRSI: stochRSI.map(s => ({ k: s.stochRSI, d: s.d })) // Adaptation if library format differs
    };
}
