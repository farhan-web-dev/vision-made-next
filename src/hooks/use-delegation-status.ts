import { useQuery } from "@tanstack/react-query";
import { ethers } from "ethers";
import { contracts } from "@/lib/contracts";
import { useWallet } from "@/contexts/WalletContext";

export function useDelegationStatus() {
  const { address, isConnected } = useWallet();

  return useQuery({
    queryKey: ["delegationStatus", address],
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

        // Check who the user has delegated to
        // Returns address(0) if not delegated, or the delegatee address if delegated
        const delegatee = await fansTokenContract.delegates(address);
        const isDelegated = delegatee !== ethers.ZeroAddress;

        return {
          isDelegated,
          delegatee: isDelegated ? delegatee : null,
        };
      } catch (error) {
        console.error("Error checking delegation status:", error);
        throw error;
      }
    },
    enabled: isConnected && !!address,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}
