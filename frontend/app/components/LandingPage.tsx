'use client'

import { ArrowRight, Twitter, TrendingUp, Users, Award, ExternalLink, Wallet, ArrowUp, Trophy } from 'lucide-react'
import { useState } from 'react'



const StatCard = ({ icon: Icon, label, value, subtext, delay = 0, className = "" }: any) => (
    <div
        className={`absolute hidden lg:flex items-center gap-4 bg-gray-900/40 backdrop-blur-md border border-gray-800/50 p-4 rounded-xl shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000 ${className}`}
        style={{ animationDelay: `${delay}ms` }}
    >
        <div className="bg-gray-800/50 p-3 rounded-lg text-cyan-400">
            <Icon size={24} />
        </div>
        <div className="text-left">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">{label}</p>
            <p className="text-xl font-bold text-white">{value}</p>
            {subtext && <p className="text-xs text-green-400">{subtext}</p>}
        </div>
    </div>
)

export default function LandingPage({ onPlay }: { onPlay: () => void }) {
    return (
        <div className="flex flex-col items-center w-full min-h-screen bg-[#0a0a0a]">
            {/* Hero Section - High Priority z-index for content */}
            <div className="relative w-full min-h-[calc(100vh-80px)] flex flex-col items-center justify-center text-center px-4 py-20 overflow-hidden">

                {/* Stats Container - Absolute to Hero Area Only */}
                <div className="absolute inset-0 max-w-7xl mx-auto pointer-events-none">
                    {/* Floating Stats - Left Side */}
                    <StatCard
                        icon={TrendingUp}
                        label="Total Volume"
                        value="$1,245,670"
                        subtext="+12.5% this week"
                        className="top-10 left-4 lg:left-10 animate-[bounce_6s_infinite] pointer-events-auto"
                        delay={200}
                    />
                    <StatCard
                        icon={Users}
                        label="Active Players"
                        value="2,849"
                        subtext="Live Now"
                        className="bottom-20 left-4 lg:left-10 animate-[bounce_8s_infinite] pointer-events-auto"
                        delay={500}
                    />

                    {/* Floating Stats - Right Side */}
                    <StatCard
                        icon={Award}
                        label="Recent Winner"
                        value="500 ARC"
                        subtext="0x8a...4b just won"
                        className="top-14 right-4 lg:right-10 animate-[bounce_7s_infinite] pointer-events-auto"
                        delay={300}
                    />
                    <StatCard
                        icon={ExternalLink}
                        label="Live Markets"
                        value="BTC/USD"
                        subtext="High Volatility"
                        className="bottom-24 right-4 lg:right-10 animate-[bounce_9s_infinite] pointer-events-auto"
                        delay={600}
                    />
                </div>

                <div className="mb-12 relative group cursor-default z-20">
                    <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative border border-gray-800 bg-black/50 backdrop-blur-xl rounded-2xl p-12">
                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-white to-purple-500 mb-4 select-none">
                            ARC
                            <span className="block text-2xl md:text-4xl font-light text-gray-400 tracking-[0.5em] mt-2">BETTING</span>
                        </h1>
                    </div>
                </div>

                <p className="max-w-xl text-gray-400 text-lg mb-10 leading-relaxed z-20">
                    Experience the future of decentralized prediction markets on the <span className="text-cyan-400 font-bold">ARC Testnet</span>.
                    Place your bets, track live markets, and win rewards in real-time.
                </p>

                <button
                    onClick={onPlay}
                    className="z-30 group relative px-10 py-5 bg-gradient-to-r from-cyan-600 to-purple-600 rounded-full font-black text-white text-xl shadow-[0_0_30px_rgba(8,145,178,0.3)] hover:shadow-[0_0_50px_rgba(147,51,234,0.5)] hover:scale-110 transition-all duration-300"
                >
                    <div className="flex items-center gap-3">
                        PLACE YOUR BET
                        <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </div>
                    <div className="absolute inset-0 rounded-full border border-white/20"></div>
                </button>

                {/* Background ambient glow - specific to Hero */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[100px] -z-10 pointer-events-none translate-x-[200px] translate-y-[-100px]"></div>
            </div>

            {/* How it Works Section - Full Width Background for Clear Separation */}
            <div className="w-full bg-gradient-to-b from-black/0 to-cyan-500/5 py-32 border-t border-white/5">
                <div className="max-w-6xl mx-auto px-4 z-20">
                    <h2 className="text-2xl font-black text-white text-center mb-16 uppercase tracking-[0.4em] flex items-center justify-center gap-4">
                        <span className="w-12 h-px bg-cyan-500/50"></span>
                        How it Works
                        <span className="w-12 h-px bg-cyan-500/50"></span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {[
                            { icon: <Wallet className="text-cyan-400" />, title: "1. Connect", desc: "Link your wallet to ARC Testnet" },
                            { icon: <Trophy className="text-purple-400" />, title: "2. Mint", desc: "Get free USDC test tokens" },
                            { icon: <ArrowUp className="text-green-400" />, title: "3. Trade", desc: "Predict BTC/ETH movements" },
                            { icon: <Award className="text-yellow-400" />, title: "4. Earn", desc: "Win ARC & Swap for USDC" },
                        ].map((item, i) => (
                            <div key={i} className="bg-[#121212]/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl group hover:border-cyan-500/50 transition-all hover:bg-white/[0.05] hover:-translate-y-2 duration-300">
                                <div className="mb-6 p-4 bg-white/5 rounded-2xl w-fit group-hover:scale-110 group-hover:bg-cyan-500/10 transition-all duration-300 shadow-xl">
                                    {item.icon}
                                </div>
                                <h3 className="font-bold text-white text-xl mb-3">{item.title}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <footer className="w-full p-10 border-t border-gray-900 bg-black/80 backdrop-blur-md flex flex-wrap justify-between items-center text-sm text-gray-500 z-50 mt-auto">
                <div className="font-medium tracking-wider uppercase text-xs">
                    © 2026 ARC Betting • Built for Testnet
                </div>
                <div className="flex gap-8">
                    <a href="https://x.com" target="_blank" className="hover:text-cyan-400 transition-all flex items-center gap-2 group">
                        <Twitter size={18} className="group-hover:scale-110 transition-transform" /> Follow on X
                    </a>
                </div>
            </footer>
        </div>
    )
}
