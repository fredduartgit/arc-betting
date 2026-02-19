import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    const network = await ethers.provider.getNetwork();
    console.log("Network Chain ID:", network.chainId.toString());

    // 1. Official ARC Network Tokens & Our Custom ARC
    const USDC_OFFICIAL_ADDRESS = "0x3600000000000000000000000000000000000000";

    // We still deploy our ARC Token for rewards/brand
    const MockToken = await ethers.getContractFactory("MockToken");
    const arc = await MockToken.deploy("ARC Token", "ARC");
    await arc.waitForDeployment();
    const arcAddress = await arc.getAddress();
    console.log("ARC Token (Our Reward) deployed to:", arcAddress);

    // 2. Deploy Betting Contract with both tokens
    const Betting = await ethers.getContractFactory("Betting");
    const betting = await Betting.deploy(USDC_OFFICIAL_ADDRESS, arcAddress);
    await betting.waitForDeployment();
    const bettingAddress = await betting.getAddress();
    console.log("Betting Contract deployed to:", bettingAddress);
    console.log("Linked to Official USDC at:", USDC_OFFICIAL_ADDRESS);

    // 3. Setup (Mint tokens to betting contract for payouts)
    const amountReward = ethers.parseUnits("100000", 18);
    await arc.mint(bettingAddress, amountReward);
    console.log("Funded Betting Contract with 100,000 ARC for rewards");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
