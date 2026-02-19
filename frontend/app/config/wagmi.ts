import { http, createConfig } from 'wagmi'
import { defineChain } from 'viem'
import { injected } from 'wagmi/connectors'

export const arcTestnet = defineChain({
    id: 5042002,
    name: 'ARC Testnet',
    nativeCurrency: { name: 'ARC', symbol: 'ARC', decimals: 18 },
    rpcUrls: {
        default: { http: ['https://rpc.testnet.arc.network'] },
    },
    blockExplorers: {
        default: { name: 'ARC Explorer', url: 'https://testnet.arcscan.app' },
    },
})

export const config = createConfig({
    chains: [arcTestnet],
    connectors: [injected()],
    transports: {
        [arcTestnet.id]: http(),
    },
})
