'use client'

import { useState } from 'react'
import { useAccount, useWriteContract, usePublicClient, useReadContract } from 'wagmi'
import { parseUnits, formatUnits, erc20Abi } from 'viem'
import { RefreshCw, ArrowDown, Loader2, X } from 'lucide-react'

interface SwapModalProps {
    isOpen: boolean
    onClose: () => void
    usdcAddress: `0x${string}`
    arcAddress: `0x${string}`
    bettingAddress: `0x${string}`
}

export default function SwapModal({ isOpen, onClose, usdcAddress, arcAddress, bettingAddress }: SwapModalProps) {
    const { address } = useAccount()
    const publicClient = usePublicClient()
    const { writeContractAsync } = useWriteContract()

    const [amount, setAmount] = useState('')
    const [isSwapping, setIsSwapping] = useState(false)

    // Balance & Allowance
    const { data: arcBalance, refetch: refetchArc } = useReadContract({
        address: arcAddress,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
    })

    const { data: arcAllowance, refetch: refetchAllowance } = useReadContract({
        address: arcAddress,
        abi: erc20Abi,
        functionName: 'allowance',
        args: address ? [address, bettingAddress] : undefined,
    })

    const hasAllowance = arcAllowance && amount && arcAllowance >= parseUnits(amount, 18)

    if (!isOpen) return null

    const handleSwap = async () => {
        if (!amount || !address || !publicClient) return
        setIsSwapping(true)
        try {
            const amountUnits = parseUnits(amount, 18)

            // 1. Approval if needed
            if (!hasAllowance) {
                const appHash = await writeContractAsync({
                    address: arcAddress,
                    abi: erc20Abi,
                    functionName: 'approve',
                    args: [bettingAddress, amountUnits]
                })
                await publicClient.waitForTransactionReceipt({ hash: appHash })
                await refetchAllowance()
            }

            // 2. Call swap function on Betting Contract
            const swapHash = await writeContractAsync({
                address: bettingAddress,
                abi: [
                    {
                        name: 'swapArcForUSDC',
                        type: 'function',
                        stateMutability: 'nonpayable',
                        inputs: [{ type: 'uint256' }],
                        outputs: []
                    }
                ],
                functionName: 'swapArcForUSDC',
                args: [amountUnits]
            })

            await publicClient.waitForTransactionReceipt({ hash: swapHash })
            alert(`Successfully swapped ${amount} ARC for Official USDC!`)
            setAmount('')
            refetchArc()
            onClose()
        } catch (e) {
            console.error(e)
            alert("Swap failed. Make sure the contract has enough USDC liquidity.")
        } finally {
            setIsSwapping(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 max-w-md w-full relative animate-in fade-in zoom-in-95 duration-200">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">
                    <X size={24} />
                </button>

                <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
                    <RefreshCw className="text-cyan-500" />
                    ARC SWAP
                </h2>

                <div className="space-y-4">
                    <div className="bg-black/50 border border-gray-800 rounded-2xl p-4">
                        <label className="text-xs text-gray-500 font-bold uppercase block mb-2">Sell ARC (Rewards)</label>
                        <div className="flex justify-between items-center">
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                className="bg-transparent text-2xl font-mono text-white focus:outline-none w-full"
                            />
                            <span className="text-purple-400 font-bold ml-2">ARC</span>
                        </div>
                        <p className="text-[10px] text-gray-600 mt-2">
                            Balance: {arcBalance ? formatUnits(arcBalance as bigint, 18) : '0'} ARC
                        </p>
                    </div>

                    <div className="flex justify-center -my-2 relative z-10">
                        <div className="bg-gray-900 border border-gray-800 p-2 rounded-xl text-cyan-500 shadow-lg">
                            <ArrowDown size={20} />
                        </div>
                    </div>

                    <div className="bg-black/50 border border-gray-800 rounded-2xl p-4">
                        <label className="text-xs text-gray-500 font-bold uppercase block mb-2">Buy USDC (Trade Funds)</label>
                        <div className="flex justify-between items-center">
                            <input
                                type="number"
                                value={amount}
                                readOnly
                                placeholder="0.00"
                                className="bg-transparent text-2xl font-mono text-white focus:outline-none w-full opacity-50"
                            />
                            <span className="text-cyan-400 font-bold ml-2">USDC</span>
                        </div>
                        <p className="text-[10px] text-gray-600 mt-2 uppercase tracking-tighter">Rate: 1.0 ARC (Reward) = 1.0 USDC (Official)</p>
                    </div>

                    <button
                        onClick={handleSwap}
                        disabled={!amount || isSwapping}
                        className="w-full py-4 bg-gradient-to-r from-cyan-600 to-purple-600 text-white font-black text-lg rounded-2xl hover:scale-[1.02] transition-all disabled:opacity-50 mt-4 shadow-xl shadow-cyan-500/10 flex items-center justify-center gap-2"
                    >
                        {isSwapping && <Loader2 className="animate-spin" />}
                        {isSwapping ? 'Swapping...' : 'CONFIRM SWAP'}
                    </button>
                </div>
            </div>
        </div>
    )
}
