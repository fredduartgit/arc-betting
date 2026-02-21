import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, LineSeries, LineData } from 'lightweight-charts';
import { Candle } from '../services/marketData';

interface MiniChartProps {
    data: Candle[];
    color?: string;
}

export const MiniChart: React.FC<MiniChartProps> = ({ data, color = '#22d3ee' }) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!chartContainerRef.current || data.length === 0) return;

        const chart = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: 80,
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: 'transparent',
            },
            grid: {
                vertLines: { visible: false },
                horzLines: { visible: false },
            },
            rightPriceScale: { visible: false },
            timeScale: { visible: false },
            handleScroll: false,
            handleScale: false,
        });

        const lineSeries = chart.addSeries(LineSeries, {
            color: color,
            lineWidth: 2,
            crosshairMarkerVisible: false,
        });

        const formattedData: LineData[] = data.map(c => ({
            time: c.time as any,
            value: c.close
        }));

        lineSeries.setData(formattedData);
        chart.timeScale().fitContent();

        const handleResize = () => {
            if (chartContainerRef.current) {
                chart.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, [data, color]);

    return <div ref={chartContainerRef} className="w-full h-20 opacity-60" />;
};
