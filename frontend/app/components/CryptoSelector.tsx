'use client'

import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

export const CRYPTO_OPTIONS = [
    { id: 'BTC', name: 'Bitcoin', symbol: 'BTC' },
    { id: 'ETH', name: 'Ethereum', symbol: 'ETH' },
    { id: 'SOL', name: 'Solana', symbol: 'SOL' },
    { id: 'BNB', name: 'Binance Coin', symbol: 'BNB' },
    { id: 'XRP', name: 'Ripple', symbol: 'XRP' },
    { id: 'ADA', name: 'Cardano', symbol: 'ADA' },
    { id: 'AVAX', name: 'Avalanche', symbol: 'AVAX' },
    { id: 'DOGE', name: 'Dogecoin', symbol: 'DOGE' },
    { id: 'DOT', name: 'Polkadot', symbol: 'DOT' },
    { id: 'LINK', name: 'Chainlink', symbol: 'LINK' },
]

export default function CryptoSelector({
    selected,
    onSelect
}: {
    selected: string,
    onSelect: (id: string) => void
}) {
    const [isOpen, setIsOpen] = useState(false)

    const selectedOption = CRYPTO_OPTIONS.find(c => c.id === selected) || CRYPTO_OPTIONS[0]

    return (
        <div className="relative w-full max-w-xs">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white hover:border-cyan-500 transition-colors"
            >
                <div className="flex items-center gap-2">
                    {/* Fallback icon or image could go here */}
                    <span className="font-bold">{selectedOption.symbol}</span>
                    <span className="text-gray-400 text-sm hidden sm:inline">{selectedOption.name}</span>
                </div>
                <ChevronDown size={20} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 w-full mt-2 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-20 max-h-60 overflow-y-auto">
                    {CRYPTO_OPTIONS.map((crypto) => (
                        <button
                            key={crypto.id}
                            onClick={() => {
                                onSelect(crypto.id)
                                setIsOpen(false)
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-gray-800 transition-colors flex items-center justify-between"
                        >
                            <span className="font-bold text-white">{crypto.symbol}</span>
                            <span className="text-gray-400 text-sm">{crypto.name}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
