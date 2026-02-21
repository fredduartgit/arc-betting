'use client'

import { useAccount, useConnect, useWriteContract, usePublicClient, useReadContract } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { useState, useEffect } from 'react'
import { parseAbiItem, decodeEventLog, formatUnits, parseUnits, erc20Abi } from 'viem'
import confetti from 'canvas-confetti'
import BettingABI from '../abi/Betting.json'
import CryptoChartLite from './CryptoChartLite'
import CryptoSelector, { CRYPTO_OPTIONS } from './CryptoSelector'
import SwapModal from './SwapModal'
import { ArrowUp, ArrowDown, Trophy, AlertTriangle, Loader2, XCircle, CheckCircle2, RefreshCw, ArrowRightLeft } from 'lucide-react'

// REPLACE WITH YOUR DEPLOYED CONTRACT ADDRESS
// UPDATED INFRASTRUCTURE (USDC 6 Decimals / ARC 18 Decimals)
const BETTING_CONTRACT_ADDRESS = "0x419b79fD4b73b2062bEf1408Fa85dfEDCc785d04"
const USDC_ADDRESS = "0x3600000000000000000000000000000000000000" // OFFICIAL ARC USDC (6 DECIMALS)
const ARC_ADDRESS = "0xbF982A1b152353FA1f6EDddB396Cc5438c5Fe29D" // OUR REWARD TOKEN (18 DECIMALS)

const CRYPTO_PRICES: Record<string, number> = {
    'BTC': 66450,
    'ETH': 2620,
    'SOL': 142,
    'BNB': 585,
    'XRP': 0.54,
    'ADA': 0.35,
    'AVAX': 28,
    'DOGE': 0.12,
    'DOT': 4.5,
    'LINK': 11.5
}

export default function BettingInterface() {
    const { address, isConnected } = useAccount()
    const { connect } = useConnect()
    const { writeContractAsync } = useWriteContract()
    const publicClient = usePublicClient()

    // Fix hydration error 
    const [mounted, setMounted] = useState(false)
    useEffect(() => {
        setMounted(true)
    }, [])

    const [selectedCrypto, setSelectedCrypto] = useState('BTC')
    const [betAmount, setBetAmount] = useState('')
    const [betId, setBetId] = useState('')
    const [isBetting, setIsBetting] = useState(false)
    const [isApproving, setIsApproving] = useState(false)
    const [isSwapOpen, setIsSwapOpen] = useState(false)
    const [lastBetStatus, setLastBetStatus] = useState<{ id: string, message: string } | null>(null)
    const [resultModal, setResultModal] = useState<{ type: 'win' | 'loss', amount?: string } | null>(null)
    const [newMaxBet, setNewMaxBet] = useState('')
    const [isSettingMaxBet, setIsSettingMaxBet] = useState(false)

    // Price markings for the chart
    const [basePrice, setBasePrice] = useState(() => (CRYPTO_PRICES['BTC'] || 66450) + (Math.random() - 0.5) * 50)
    const [entryPrice, setEntryPrice] = useState<number | undefined>(undefined)
    const [winPrice, setWinPrice] = useState<number | undefined>(undefined)
    const [lossPrice, setLossPrice] = useState<number | undefined>(undefined)

    // Update basePrice when selectedCrypto changes
    useEffect(() => {
        const newBase = (CRYPTO_PRICES[selectedCrypto] || 50000)
        // Add a bit of random variation so the chart feels live
        setBasePrice(newBase + (Math.random() - 0.5) * (newBase * 0.001))

        // Clear lines when switching crypto
        setEntryPrice(undefined)
        setWinPrice(undefined)
        setLossPrice(undefined)
    }, [selectedCrypto])

    // Read Allowance
    const { data: allowance, refetch: refetchAllowance } = useReadContract({
        address: USDC_ADDRESS,
        abi: erc20Abi,
        functionName: 'allowance',
        args: address ? [address, BETTING_CONTRACT_ADDRESS] : undefined,
        query: {
            enabled: !!address,
        }
    })

    // Read Max Bet Amount
    const { data: maxBetAmount, refetch: refetchMaxBet } = useReadContract({
        address: BETTING_CONTRACT_ADDRESS,
        abi: BettingABI,
        functionName: 'maxBetAmount',
    })

    // @ts-ignore
    const hasAllowance = allowance && betAmount && allowance >= parseUnits(betAmount, 6)

    const isAmountOverLimit = Boolean(betAmount && maxBetAmount && parseUnits(betAmount, 6) > (maxBetAmount as bigint))

    async function handleConnect() {
        connect({ connector: injected() })
    }

    async function handleApprove() {
        if (!betAmount || !isConnected) return
        setIsApproving(true)
        try {
            const hash = await writeContractAsync({
                address: USDC_ADDRESS,
                abi: erc20Abi,
                functionName: 'approve',
                args: [BETTING_CONTRACT_ADDRESS, parseUnits(betAmount, 6)],
            })
            console.log("Approve Hash:", hash)
            await publicClient?.waitForTransactionReceipt({ hash })
            await refetchAllowance()

            // CELEBRATION! 
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#06b6d4', '#8b5cf6', '#ffffff']
            })

            alert("USDC Approved! You can now place your bet.")
        } catch (err) {
            console.error(err)
            alert("Error approving USDC")
        } finally {
            setIsApproving(false)
        }
    }

    async function placeBet(isUp: boolean) {
        if (!betAmount || !isConnected || !publicClient) return
        setIsBetting(true)
        setLastBetStatus(null)

        try {
            const hash = await writeContractAsync({
                address: BETTING_CONTRACT_ADDRESS,
                abi: BettingABI,
                functionName: 'placeBet',
                args: [parseUnits(betAmount, 6), isUp],
            })

            console.log("Tx Hash:", hash)
            const receipt = await publicClient.waitForTransactionReceipt({ hash })

            // Simulation of current price synced with chart's base
            const currentSimulationPrice = basePrice + (Math.random() - 0.5) * 100
            const percentage = 0.005 // 0.5%

            setEntryPrice(currentSimulationPrice)
            if (isUp) {
                setWinPrice(currentSimulationPrice * (1 + percentage))
                setLossPrice(currentSimulationPrice * (1 - percentage))
            } else {
                setWinPrice(currentSimulationPrice * (1 - percentage))
                setLossPrice(currentSimulationPrice * (1 + percentage))
            }

            let foundId = null
            for (const log of receipt.logs) {
                try {
                    const decoded = decodeEventLog({
                        abi: BettingABI,
                        data: log.data,
                        topics: log.topics
                    })
                    if (decoded.eventName === 'BetPlaced') {
                        const args = decoded.args as any
                        foundId = args.betId?.toString()
                        break
                    }
                } catch (e) {
                }
            }

            if (foundId) {
                setBetId(foundId)
                setLastBetStatus({
                    id: foundId,
                    message: `Bet placed successfully! Bet ID: ${foundId}`
                })
            } else {
                alert('Bet placed, but could not capture ID automatically.')
            }

            setBetAmount('')
            await refetchAllowance() // Update allowance immediately after bet
        } catch (err: any) {
            console.error(err)
            if (err.message && err.message.includes("User rejected")) {
                alert("Transaction rejected by user.")
            } else {
                alert(`Error placing bet: ${err.message || "Unknown error"}`)
            }
        } finally {
            setIsBetting(false)
        }
    }

    async function resolveBet(won: boolean) {
        if (!betId) return
        try {
            const txPromise = writeContractAsync({
                address: BETTING_CONTRACT_ADDRESS,
                abi: BettingABI,
                functionName: 'resolveBet',
                args: [BigInt(betId), won],
            })

            // Show result modal immediately (simulating flow) 
            // In real app, we would wait for receipt and check events
            if (won) {
                setResultModal({ type: 'win', amount: '2x Payout' })
                confetti({
                    particleCount: 200,
                    spread: 100,
                    origin: { y: 0.5 },
                    colors: ['#22c55e', '#ffffff', '#eab308']
                })
            } else {
                setResultModal({ type: 'loss' })
            }

            // Clear markers after resolution
            setEntryPrice(undefined)
            setWinPrice(undefined)
            setLossPrice(undefined)

            await txPromise
            // In a real app we wouldn't clear betId immediately if user needs to claim
            // but for this MVP debug flow it's okay.
        } catch (err) {
            console.error(err)
            alert('Error resolving bet')
        }
    }

    async function claimReward() {
        if (!betId || !publicClient) return
        try {
            const hash = await writeContractAsync({
                address: BETTING_CONTRACT_ADDRESS,
                abi: BettingABI,
                functionName: 'claimReward',
                args: [BigInt(betId)],
            })
            await publicClient.waitForTransactionReceipt({ hash })
            alert('Reward claimed successfully! Check your ARC balance.')
            setBetId('')
            setLastBetStatus(null)
        } catch (err) {
            console.error(err)
            alert('Error claiming reward. Make sure the bet is resolved as WIN.')
        }
    }

    if (!mounted) return null

    return (
        <div className="container mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Result Modal Overlay */}
            {resultModal && (
                <div className="fixed inset-0 z-[101] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className={`
                        relative overflow-hidden bg-gray-900 border ${resultModal.type === 'win' ? 'border-green-500/50 shadow-[0_0_50px_rgba(34,197,94,0.3)]' : 'border-red-500/50 shadow-[0_0_50px_rgba(239,68,68,0.2)]'} 
                        rounded-3xl p-10 max-w-sm w-full text-center animate-in zoom-in-95 duration-300
                    `}>
                        {/* Background Glow */}
                        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 ${resultModal.type === 'win' ? 'bg-green-500/20' : 'bg-red-500/20'} blur-[60px] -z-10`}></div>

                        <div className="flex justify-center mb-6">
                            {resultModal.type === 'win' ? (
                                <div className="bg-green-500/10 p-5 rounded-full ring-4 ring-green-500/20 animate-bounce">
                                    <CheckCircle2 size={64} className="text-green-500" />
                                </div>
                            ) : (
                                <div className="bg-red-500/10 p-5 rounded-full ring-4 ring-red-500/20 animate-pulse">
                                    <XCircle size={64} className="text-red-500" />
                                </div>
                            )}
                        </div>

                        <h2 className={`text-4xl font-black mb-2 tracking-tight ${resultModal.type === 'win' ? 'text-green-400' : 'text-red-400'}`}>
                            {resultModal.type === 'win' ? 'YOU WON!' : 'BET LOST'}
                        </h2>

                        <p className="text-gray-400 text-lg mb-8">
                            {resultModal.type === 'win'
                                ? `Congratulations! You received ${resultModal.amount}. Check your wallet!`
                                : 'The market moved against you this time. Ready for another round?'}
                        </p>

                        <button
                            onClick={() => setResultModal(null)}
                            className={`
                                w-full py-4 rounded-xl font-black text-xl transition-all hover:scale-105 active:scale-95
                                ${resultModal.type === 'win'
                                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/20'
                                    : 'bg-gray-800 text-white border border-gray-700'}
                            `}
                        >
                            {resultModal.type === 'win' ? 'AWESOME!' : 'TRY AGAIN'}
                        </button>
                    </div>
                </div>
            )}

            <SwapModal
                isOpen={isSwapOpen}
                onClose={() => setIsSwapOpen(false)}
                usdcAddress={USDC_ADDRESS}
                arcAddress={ARC_ADDRESS}
                bettingAddress={BETTING_CONTRACT_ADDRESS}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Chart & Selector */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <span className="bg-cyan-500 w-1 h-6 rounded-full inline-block"></span>
                            Pro Chart Analysis
                        </h2>
                        <div className="flex gap-2">
                            <button className="bg-gray-900 border border-gray-800 p-2 rounded-lg text-gray-400 hover:text-cyan-400">
                                <RefreshCw size={18} />
                            </button>
                            <CryptoSelector selected={selectedCrypto} onSelect={setSelectedCrypto} />
                        </div>
                    </div>

                    <CryptoChartLite
                        key={selectedCrypto}
                        symbol={selectedCrypto}
                        basePrice={basePrice}
                        entryPrice={entryPrice}
                        winPrice={winPrice}
                        lossPrice={lossPrice}
                    />

                    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                        <h3 className="text-lg font-bold mb-4 text-gray-400 flex items-center gap-2">
                            <AlertTriangle size={18} className="text-cyan-500" />
                            How to Read Your Trade
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                            <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                                <span className="font-bold text-blue-400 block mb-1 underline">BLUE LINE (ENTRY)</span>
                                Price locked at the moment your transaction was confirmed on ARC.
                            </div>
                            <div className="p-3 bg-green-500/5 border border-green-500/20 rounded-lg">
                                <span className="font-bold text-green-400 block mb-1 underline">GREEN LINE (WIN)</span>
                                Target price to Win (+0.5% for UP, -0.5% for DOWN).
                            </div>
                            <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
                                <span className="font-bold text-red-400 block mb-1 underline">RED LINE (LOSS)</span>
                                Price that negates your prediction (-0.5% for UP, +0.5% for DOWN).
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Betting Interface */}
                <div className="space-y-6">

                    {/* Rewards & Swap Card */}
                    <div className="bg-gradient-to-br from-purple-900/40 to-cyan-900/20 border border-purple-500/30 rounded-xl p-5 shadow-xl relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all"></div>
                        <h3 className="text-sm font-bold text-purple-300 mb-3 flex items-center gap-2 uppercase tracking-widest">
                            <ArrowRightLeft size={16} /> Interoperability
                        </h3>
                        <div className="flex items-end justify-between mb-4">
                            <div>
                                <p className="text-xs text-gray-400">Your Rewards</p>
                                <p className="text-2xl font-black text-white">ARC Token</p>
                            </div>
                            <button
                                onClick={() => setIsSwapOpen(true)}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-all hover:scale-105 flex items-center gap-2 shadow-lg shadow-purple-900/50"
                            >
                                <RefreshCw size={14} /> SWAP TO USDC
                            </button>
                        </div>
                        <div className="text-[10px] text-gray-500 leading-tight">
                            Win ARC tokens on predictions and swap them instantly for USDC to continue trading.
                        </div>
                    </div>

                    {/* Betting Card */}
                    <div className="bg-[#121212] border border-gray-800 rounded-xl p-6 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-purple-600"></div>

                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Trophy className="text-yellow-500" />
                            Place Your Bet
                        </h2>

                        {!isConnected ? (
                            <div className="text-center py-10 space-y-4">
                                <p className="text-gray-400">Connect your wallet to start betting on the future.</p>
                                <button
                                    onClick={handleConnect}
                                    className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg font-bold hover:opacity-90 transition-opacity"
                                >
                                    Connect Wallet
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Bet Amount (USDC)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={betAmount}
                                            onChange={(e) => setBetAmount(e.target.value)}
                                            placeholder="0.00"
                                            className="w-full bg-black/50 border border-gray-700 rounded-lg py-3 px-4 text-white focus:border-cyan-500 focus:outline-none transition-colors text-lg font-mono"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">USDC</span>
                                    </div>
                                </div>

                                {!hasAllowance && betAmount ? (
                                    <button
                                        onClick={handleApprove}
                                        disabled={isApproving}
                                        className="w-full py-4 bg-yellow-600 hover:bg-yellow-700 rounded-xl font-bold text-black transition-all flex items-center justify-center gap-2"
                                    >
                                        {isApproving ? <Loader2 className="animate-spin" /> : <AlertTriangle />}
                                        {isApproving ? 'Approving...' : 'Approve USDC'}
                                    </button>
                                ) : (
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => placeBet(true)}
                                            disabled={!betAmount || isBetting || isAmountOverLimit}
                                            className={`
                                            relative overflow-hidden group/btn flex flex-col items-center justify-center gap-2 py-6 rounded-xl border border-green-900/50 bg-green-500/10 transition-all
                                            ${(!betAmount || isBetting || isAmountOverLimit) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-500/20 hover:border-green-500 hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_15px_rgba(34,197,94,0.2)]'}
                                        `}
                                        >
                                            <div className="absolute inset-0 bg-green-500/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
                                            <ArrowUp size={32} className="text-green-400 z-10 group-hover/btn:-translate-y-1 transition-transform" />
                                            <span className="text-green-400 font-bold text-lg z-10">UP</span>
                                        </button>

                                        <button
                                            onClick={() => placeBet(false)}
                                            disabled={!betAmount || isBetting || isAmountOverLimit}
                                            className={`
                                            relative overflow-hidden group/btn flex flex-col items-center justify-center gap-2 py-6 rounded-xl border border-red-900/50 bg-red-500/10 transition-all
                                            ${(!betAmount || isBetting || isAmountOverLimit) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-500/20 hover:border-red-500 hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_15px_rgba(239,68,68,0.2)]'}
                                        `}
                                        >
                                            <div className="absolute inset-0 bg-red-500/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
                                            <ArrowDown size={32} className="text-red-400 z-10 group-hover/btn:translate-y-1 transition-transform" />
                                            <span className="text-red-400 font-bold text-lg z-10">DOWN</span>
                                        </button>
                                    </div>
                                )}

                                {isAmountOverLimit && (
                                    <p className="text-red-400 text-[10px] text-center mt-2 font-bold animate-pulse">
                                        ⚠️ Max limit: {maxBetAmount ? formatUnits(maxBetAmount as bigint, 6) : '10'} USDC
                                    </p>
                                )}

                                {lastBetStatus && (
                                    <div className="bg-cyan-500/10 border border-cyan-500/50 rounded-lg p-3 text-center animate-in fade-in slide-in-from-top-2 flex flex-col gap-2">
                                        <p className="text-cyan-400 font-bold text-sm">{lastBetStatus.message}</p>
                                        <div className="flex gap-2 justify-center">
                                            <button
                                                onClick={claimReward}
                                                className="bg-cyan-500 hover:bg-cyan-600 text-black text-xs font-bold px-4 py-1.5 rounded-full transition-all"
                                            >
                                                CLAIM REWARD 🏆
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <p className="text-xs text-center text-gray-500 mt-4">
                                    *Bets are settled based on price movement within 5 minutes.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Admin Card */}
                    {isConnected && (
                        <div className="bg-[#121212] border border-gray-800 rounded-xl p-6 opacity-75 hover:opacity-100 transition-opacity space-y-4">
                            <div>
                                <h3 className="text-sm font-bold text-gray-400 mb-2 flex items-center gap-2">
                                    <AlertTriangle size={16} /> Admin Panel (Debug)
                                </h3>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Bet ID"
                                        value={betId}
                                        onChange={(e) => setBetId(e.target.value)}
                                        className="flex-1 bg-black/50 border border-gray-700 rounded px-3 py-2 text-sm"
                                    />
                                    <button onClick={() => resolveBet(true)} className="bg-green-900/50 text-green-400 text-xs px-3 py-2 rounded hover:bg-green-900">Win</button>
                                    <button onClick={() => resolveBet(false)} className="bg-red-900/50 text-red-400 text-xs px-3 py-2 rounded hover:bg-red-900">Lose</button>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-800">
                                <h3 className="text-sm font-bold text-gray-400 mb-2 flex items-center gap-2">
                                    <RefreshCw size={16} className={isSettingMaxBet ? 'animate-spin' : ''} /> Set Max Bet limit
                                </h3>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <input
                                            type="text"
                                            placeholder="New Max (e.g. 50)"
                                            value={newMaxBet}
                                            onChange={(e) => setNewMaxBet(e.target.value)}
                                            className="w-full bg-black/50 border border-gray-700 rounded px-3 py-2 text-sm pr-12"
                                        />
                                        <span className="absolute right-3 top-2 text-gray-500 text-xs">USDC</span>
                                    </div>
                                    <button
                                        onClick={async () => {
                                            if (!newMaxBet || !publicClient) return
                                            setIsSettingMaxBet(true)
                                            try {
                                                const hash = await writeContractAsync({
                                                    address: BETTING_CONTRACT_ADDRESS,
                                                    abi: BettingABI,
                                                    functionName: 'setMaxBetAmount',
                                                    args: [parseUnits(newMaxBet, 6)]
                                                })
                                                await publicClient.waitForTransactionReceipt({ hash })
                                                await refetchMaxBet()
                                                alert(`Max bet updated to ${newMaxBet} USDC!`)
                                                setNewMaxBet('')
                                            } catch (e) { console.error(e); alert('Error updating limit') }
                                            finally { setIsSettingMaxBet(false) }
                                        }}
                                        disabled={isSettingMaxBet}
                                        className="bg-purple-900/50 text-purple-400 text-xs px-4 py-2 rounded hover:bg-purple-900 transition-colors disabled:opacity-50"
                                    >
                                        Update
                                    </button>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-800">
                                <h3 className="text-sm font-bold text-gray-400 mb-2 flex items-center gap-2">
                                    <Trophy size={16} className="text-yellow-500" /> Treasury & Faucet (Testnet)
                                </h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={async () => {
                                            if (!publicClient) return
                                            try {
                                                const hash = await writeContractAsync({
                                                    address: USDC_ADDRESS,
                                                    abi: [parseAbiItem('function mint(address, uint256)')],
                                                    functionName: 'mint',
                                                    args: [BETTING_CONTRACT_ADDRESS, parseUnits('10000', 18)]
                                                })
                                                await publicClient.waitForTransactionReceipt({ hash })
                                                alert('Bankroll funded with 10,000 USDC!')
                                            } catch (e) { console.error(e); alert('Error funding bankroll') }
                                        }}
                                        className="bg-blue-900/30 border border-blue-500/30 text-blue-400 text-xs px-3 py-2 rounded hover:bg-blue-900/50 transition-colors"
                                    >
                                        🏦 Fund Bankroll (10k)
                                    </button>
                                    <button
                                        onClick={() => {
                                            window.open('https://faucet.arc.network', '_blank')
                                        }}
                                        className="bg-green-900/30 border border-green-500/30 text-green-400 text-xs px-3 py-2 rounded hover:bg-green-900/50 transition-colors flex items-center justify-center gap-1"
                                    >
                                        🌐 Official USDC Faucet
                                    </button>
                                </div>
                                <button
                                    onClick={() => {
                                        // @ts-ignore
                                        if (window.ethereum) {
                                            // @ts-ignore
                                            window.ethereum.request({
                                                method: 'wallet_watchAsset',
                                                params: {
                                                    type: 'ERC20',
                                                    options: {
                                                        address: USDC_ADDRESS,
                                                        symbol: 'USDC',
                                                        decimals: 6,
                                                    },
                                                },
                                            })
                                        } else {
                                            alert("Please verify manually with address: " + USDC_ADDRESS)
                                        }
                                    }}
                                    className="w-full mt-3 bg-gray-800 hover:bg-gray-700 text-xs text-gray-400 py-2 rounded transition-colors flex items-center justify-center gap-2"
                                >
                                    ➕ Add USDC to Wallet (Metamask)
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    )
}
