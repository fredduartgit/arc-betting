'use client'

import { useEffect, useRef } from 'react'
import { createChart, IChartApi, ISeriesApi, ColorType, LineStyle, AreaSeries } from 'lightweight-charts'

interface CryptoChartLiteProps {
    symbol: string
    basePrice?: number
    entryPrice?: number
    winPrice?: number
    lossPrice?: number
    isLive?: boolean
}

export default function CryptoChartLite({
    symbol,
    basePrice = 50000,
    entryPrice,
    winPrice,
    lossPrice,
    isLive = true
}: CryptoChartLiteProps) {
    const chartContainerRef = useRef<HTMLDivElement>(null)
    const chartRef = useRef<IChartApi | null>(null)
    const seriesRef = useRef<ISeriesApi<any> | null>(null)

    // Line handles to clear them
    const entryLineRef = useRef<any>(null)
    const winLineRef = useRef<any>(null)
    const lossLineRef = useRef<any>(null)

    useEffect(() => {
        if (!chartContainerRef.current) return

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: '#9ca3af',
            },
            grid: {
                vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
                horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
            },
            width: chartContainerRef.current.clientWidth,
            height: 400,
            timeScale: {
                borderVisible: false,
                timeVisible: true,
                secondsVisible: false,
            },
            rightPriceScale: {
                borderVisible: false,
                autoScale: true, // Crucial for visibility
            }
        })

        const series = chart.addSeries(AreaSeries, {
            lineColor: '#06b6d4',
            topColor: 'rgba(6, 182, 212, 0.3)',
            bottomColor: 'rgba(6, 182, 212, 0)',
            lineWidth: 2,
        })

        // Initial data based on basePrice
        const initialData: { time: any; value: number }[] = []
        let currentPrice = basePrice
        const now = Math.floor(Date.now() / 1000)

        for (let i = 0; i < 100; i++) {
            initialData.push({
                time: (now - (100 - i) * 60) as any,
                value: currentPrice + (Math.random() - 0.5) * 50
            })
            currentPrice += (Math.random() - 0.5) * 50
        }
        series.setData(initialData)

        chartRef.current = chart
        seriesRef.current = series

        const interval = setInterval(() => {
            if (!isLive || !seriesRef.current) return
            const lastData = initialData[initialData.length - 1]
            const newPrice = lastData.value + (Math.random() - 0.5) * 30
            seriesRef.current.update({
                time: Math.floor(Date.now() / 1000) as any,
                value: newPrice
            })
            initialData.push({ time: Math.floor(Date.now() / 1000) as any, value: newPrice })
        }, 3000)

        const handleResize = () => {
            if (chartContainerRef.current && chartRef.current) {
                chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth })
            }
        }
        window.addEventListener('resize', handleResize)

        return () => {
            clearInterval(interval)
            window.removeEventListener('resize', handleResize)
            chart.remove()
        }
    }, [symbol, isLive, basePrice])

    // Effect to handle price lines (Entry, Win, Loss)
    useEffect(() => {
        const series = seriesRef.current
        if (!series) return

        // Clear existing lines if any
        if (entryLineRef.current) series.removePriceLine(entryLineRef.current)
        if (winLineRef.current) series.removePriceLine(winLineRef.current)
        if (lossLineRef.current) series.removePriceLine(lossLineRef.current)

        if (entryPrice) {
            entryLineRef.current = series.createPriceLine({
                price: entryPrice,
                color: '#3b82f6',
                lineWidth: 2,
                lineStyle: LineStyle.Dashed,
                axisLabelVisible: true,
                title: 'ENTRY',
            })
        }

        if (winPrice) {
            winLineRef.current = series.createPriceLine({
                price: winPrice,
                color: '#22c55e',
                lineWidth: 2,
                lineStyle: LineStyle.Solid,
                axisLabelVisible: true,
                title: 'TARGET WIN',
            })
        }

        if (lossPrice) {
            lossLineRef.current = series.createPriceLine({
                price: lossPrice,
                color: '#ef4444',
                lineWidth: 2,
                lineStyle: LineStyle.Solid,
                axisLabelVisible: true,
                title: 'TARGET LOSS',
            })
        }
    }, [entryPrice, winPrice, lossPrice])

    return (
        <div className="w-full bg-black/40 border border-gray-800 rounded-2xl overflow-hidden p-4">
            <div ref={chartContainerRef} />
        </div>
    )
}
