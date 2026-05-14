import governorContractAbi from "../../abis/governerContract.json";
import fansTokenAbi from "../../abis/FanzToken.json";
import marketplaceAbi from "../../abis/Marketplace.json";

// Get contract addresses from environment variables
const governorAddress =
  import.meta.env.VITE_GOVERNOR_CONTRACT_ADDRESS ||
  "0x26bD2bF50f5C91CAD0E66c215116ECDDCcE9F325"; // Default Sepolia address from config.env

const fzTokenAddress =
  import.meta.env.VITE_FZ_TOKEN_ADDRESS ||
  "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Default Sepolia address from config.env

const marketplaceAddress =
  import.meta.env.VITE_MARKETPLACE_ADDRESS ||
  "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Default Sepolia address from config.env

// Validate that addresses are not zero address
if (governorAddress === "0x0000000000000000000000000000000000000000") {
  console.error(
    "⚠️ WARNING: Governor contract address is not set! Please set VITE_GOVERNOR_CONTRACT_ADDRESS in your .env file"
  );
}

if (fzTokenAddress === "0x0000000000000000000000000000000000000000") {
  console.error(
    "⚠️ WARNING: FanzToken contract address is not set! Please set VITE_FZ_TOKEN_ADDRESS in your .env file"
  );
}

export const contracts = {
  governor: {
    address: governorAddress as `0x${string}`,
    abi: governorContractAbi.abi,
  },
  fansToken: {
    address: fzTokenAddress as `0x${string}`,
    abi: fansTokenAbi.abi,
  },
  marketplace: {
    address: marketplaceAddress as `0x${string}`,
    abi: marketplaceAbi.abi,
  },
};
