import { useQuery } from "@tanstack/react-query";
import { ethers } from "ethers";
import { contracts } from "@/lib/contracts";
import { useWallet } from "@/contexts/WalletContext";

export function useTokenBalance() {
  const { address, isConnected } = useWallet();

  return useQuery({
    queryKey: ["tokenBalance", address],
    queryFn: async () => {
      if (!isConnected || !address || typeof window.ethereum === "undefined") {
        return null;
      }

      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const fansTokenContract = new ethers.Contract(
          contracts.fansToken.address,
          contracts.fansToken.abi,
          provider
        );

        const balance = await fansTokenContract.balanceOf(address);
        return ethers.formatEther(balance);
      } catch (error) {
        console.error("Error fetching token balance:", error);
        throw error;
      }
    },
    enabled: isConnected && !!address,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}
