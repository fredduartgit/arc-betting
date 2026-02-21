export interface Candle {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export async function fetchKlines(symbol: string = 'BTCUSDT', interval: string = '4h', limit: number = 500): Promise<Candle[]> {
    try {
        const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`);
        const data = await response.json();

        return data.map((d: any) => ({
            time: d[0] / 1000, // Conversion to seconds
            open: parseFloat(d[1]),
            high: parseFloat(d[2]),
            low: parseFloat(d[3]),
            close: parseFloat(d[4]),
            volume: parseFloat(d[5]),
        }));
    } catch (error) {
        console.error('Error fetching klines:', error);
        return [];
    }
}
