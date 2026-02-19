# ARC Betting dApp

A simple Web3 betting application on the ARC Testnet. Users can bet Test-USDC on price movements.

## Prerequisites
- Node.js & npm
- MetaMask Wallet
- ARC Testnet RPC URL (Find at [https://arc.io](https://arc.io) or official docs)
- Testnet ARC (for gas) and Testnet USDC (Mocked in this project)

## Project Structure
- `hardhat/`: Smart contracts, tests, and deployment scripts.
- `frontend/`: Next.js Web3 application.

## Setup Guide

### 1. Smart Contracts Configuration
Navigate to the `hardhat` folder and setup your environment:
```bash
cd hardhat
mv .env.example .env
```
Open `.env` and fill in:
- `ARC_TESTNET_RPC`: URL from ARC documentation.
- `PRIVATE_KEY`: Your wallet private key (Export from MetaMask). **Never share this!**

### 2. Deploy Contracts
Compile and deploy the contracts to ARC Testnet:
```bash
npx hardhat compile
npx hardhat run scripts/deploy.ts --network arc_testnet
```
**SAVE THE OUTPUT!** You will see:
- `Test USDC deployed to: 0x...`
- `Betting Contract deployed to: 0x...`

### 3. Frontend Configuration
Navigate to the `frontend` folder:
```bash
cd ../frontend
npm install
```
Open `app/page.tsx` and update the constants at the top:
```typescript
const BETTING_CONTRACT_ADDRESS = "0x..." // Paste Betting contract address here
const USDC_ADDRESS = "0x..." // Paste Test USDC address here
```

Open `app/config/wagmi.ts` and update the Chain ID and RPC:
```typescript
id: 12345, // Replace with actual ARC Chain ID
rpcUrls: { default: { http: ['https://...'] } }, // Replace with actual RPC
```

### 4. Run the App
Start the frontend locally:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

## How to use
1. **Connect Wallet**: Click the button to connect MetaMask.
2. **Get Tokens**:
   - The deployer wallet has 1,000,000 Test USDC.
   - Transfer some to your testing account or use the deployer account.
3. **Place Bet**: Enter an amount and click "Bet UP" or "Bet DOWN".
   - You might need to Approve USDC first (code has a comment implementation).
4. **Resolve Bet (Admin)**:
   - Copy the `Bet ID` from the console/logs.
   - Paste it in the Admin panel and click "User Won" or "User Lost".

## Common Errors
- **Nonce too low**: Reset your MetaMask account transaction history (Settings > Advanced > Clear Activity Tab).
- **Insufficient funds**: Ensure you have Testnet ARC for gas.
- **Provider Error**: Check your RPC URL in `hardhat.config.ts` and `frontend/app/config/wagmi.ts`.
