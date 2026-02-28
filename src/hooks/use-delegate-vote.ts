import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ethers } from "ethers";
import { toast } from "sonner";
import { contracts } from "@/lib/contracts";
import { useWallet } from "@/contexts/WalletContext";

export function useDelegateVote() {
  const queryClient = useQueryClient();
  const { address, isConnected, checkNetwork, switchToSepolia } = useWallet();

  return useMutation({
    mutationFn: async () => {
      if (!isConnected || !address) {
        throw new Error("Please connect your wallet to delegate");
      }

      if (typeof window.ethereum === "undefined") {
        throw new Error("MetaMask is not installed");
      }

      try {
        // Validate contract address
        if (
          !contracts.fansToken.address ||
          contracts.fansToken.address ===
            "0x0000000000000000000000000000000000000000"
        ) {
          throw new Error(
            "FanzToken contract address is not configured. Please set VITE_FZ_TOKEN_ADDRESS in your .env file"
          );
        }

        // Check if on Sepolia network, switch if not
        const isSepolia = await checkNetwork();
        if (!isSepolia) {
          toast.info("Switching to Sepolia network...");
          await switchToSepolia();
        }

        // Get provider and signer
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        // Create contract instance
        const fansTokenContract = new ethers.Contract(
          contracts.fansToken.address,
          contracts.fansToken.abi,
          signer
        );

        // Delegate to self (user's address)
        const tx = await fansTokenContract.delegate(address);

        // Wait for transaction confirmation
        const receipt = await tx.wait();

        return receipt;
      } catch (error) {
        // Handle user rejection
        if (
          error &&
          typeof error === "object" &&
          "code" in error &&
          error.code === 4001
        ) {
          throw new Error("Transaction was rejected");
        }
        // Handle other errors
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to delegate voting power";
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      toast.success("Successfully delegated voting power to yourself");
      // Invalidate queries to refetch delegation status and token balance
      queryClient.invalidateQueries({ queryKey: ["delegationStatus"] });
      queryClient.invalidateQueries({ queryKey: ["tokenBalance"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delegate voting power");
    },
  });
}
