'use client'

import { useEffect, useRef, useState } from 'react'

let tvScriptLoadingPromise: Promise<void> | null = null

export default function CryptoChart({ symbol }: { symbol: string }) {
    const onLoadScriptRef = useRef<(() => void) | null>(null)

    useEffect(() => {
        onLoadScriptRef.current = createWidget

        if (!tvScriptLoadingPromise) {
            tvScriptLoadingPromise = new Promise((resolve) => {
                const script = document.createElement('script')
                script.id = 'tradingview-widget-loading-script'
                script.src = 'https://s3.tradingview.com/tv.js'
                script.type = 'text/javascript'
                script.onload = resolve as any

                document.head.appendChild(script)
            })
        }

        tvScriptLoadingPromise.then(() => onLoadScriptRef.current && onLoadScriptRef.current())

        return () => {
            onLoadScriptRef.current = null
        }

        function createWidget() {
            // @ts-ignore
            if (document.getElementById('tradingview_widget') && 'TradingView' in window) {
                // @ts-ignore
                new window.TradingView.widget({
                    autosize: true,
                    symbol: `BINANCE:${symbol}USDT`,
                    interval: "D",
                    timezone: "Etc/UTC",
                    theme: "dark",
                    style: "1",
                    locale: "en",
                    enable_publishing: false,
                    allow_symbol_change: true,
                    container_id: "tradingview_widget"
                })
            }
        }
    }, [symbol])

    return (
        <div className='h-[400px] w-full bg-gray-900 rounded-lg overflow-hidden border border-gray-800' id="tradingview_widget" />
    )
}
