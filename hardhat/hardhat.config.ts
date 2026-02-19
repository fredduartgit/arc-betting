import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const ARC_TESTNET_RPC = process.env.ARC_TESTNET_RPC || "https://testnet-rpc.arc.io"; // REPLACE with actual RPC
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0000000000000000000000000000000000000000000000000000000000000000";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    arc_testnet: {
      url: ARC_TESTNET_RPC,
      accounts: [PRIVATE_KEY],
      // chainId: 0, // Auto-detect
    },
  },
};

export default config;
