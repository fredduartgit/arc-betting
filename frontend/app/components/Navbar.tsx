'use client'

import Link from 'next/link'
import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { useState, useEffect } from 'react'
import { Wallet, LogOut, AlertTriangle } from 'lucide-react'
import { arcTestnet } from '../config/wagmi'

export default function Navbar() {
    const { address, isConnected, chain } = useAccount()
    const { connect } = useConnect()
    const { disconnect } = useDisconnect()
    const { switchChain } = useSwitchChain()

    const [mounted, setMounted] = useState(false)
    useEffect(() => {
        setMounted(true)
    }, [])

    function handleConnect() {
        connect({ connector: injected() })
    }

    return (
        <nav className="flex items-center justify-between p-4 border-b border-gray-800 bg-black/50 backdrop-blur-md sticky top-0 z-50">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
                ARC Betting
            </Link>

            <div className="flex items-center gap-4">
                {/* Network Guard Modal */}
                {mounted && isConnected && chain?.id !== arcTestnet.id && (
                    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-gray-900 border border-red-500/50 rounded-2xl p-8 max-w-md w-full text-center shadow-[0_0_50px_rgba(239,68,68,0.3)] animate-in zoom-in-95 duration-200">
                            <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                                <AlertTriangle size={32} className="text-red-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Wrong Network</h2>
                            <p className="text-gray-400 mb-8">
                                You are connected to <span className="text-red-400 font-mono">{chain?.name || "Unknown Chain"}</span>.
                                Please switch to <span className="text-cyan-400 font-bold">ARC Testnet</span> to place bets.
                            </p>
                            <button
                                onClick={() => switchChain({ chainId: arcTestnet.id })}
                                className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all hover:scale-105 shadow-lg"
                            >
                                Switch to ARC Testnet
                            </button>
                            <button
                                onClick={() => disconnect()}
                                className="mt-4 text-sm text-gray-500 hover:text-white transition-colors"
                            >
                                Disconnect Wallet
                            </button>
                        </div>
                    </div>
                )}

                {mounted && isConnected ? (
                    <div className="flex items-center gap-2 bg-gray-900 border border-gray-700 rounded-full px-4 py-2">
                        <span className="text-sm font-mono text-cyan-400">
                            {address?.slice(0, 6)}...{address?.slice(-4)}
                        </span>
                        <button
                            onClick={() => disconnect()}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                            title="Disconnect"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={handleConnect}
                        className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-black font-bold px-4 py-2 rounded-full transition-all shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                    >
                        <Wallet size={18} />
                        Connect Wallet
                    </button>
                )}
            </div>
        </nav>
    )
}
