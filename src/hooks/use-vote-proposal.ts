import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ethers } from "ethers";
import { toast } from "sonner";
import { contracts } from "@/lib/contracts";
import { useWallet } from "@/contexts/WalletContext";
import { voteProposal } from "@/apis/proposals";

export interface VoteProposalParams {
  proposalId: string | number;
  vote: number; // 0 for reject, 1 for approve
}

export function useVoteProposal() {
  const queryClient = useQueryClient();
  const { isConnected, checkNetwork, switchToSepolia } = useWallet();

  return useMutation({
    mutationFn: async ({ proposalId, vote }: VoteProposalParams) => {
      // Validate proposalId
      if (
        proposalId === undefined ||
        proposalId === null ||
        proposalId === ""
      ) {
        throw new Error("Proposal ID is missing");
      }

      // Convert to string/number for validation
      const proposalIdStr = String(proposalId).trim();
      if (
        proposalIdStr === "" ||
        proposalIdStr === "undefined" ||
        proposalIdStr === "null"
      ) {
        throw new Error("Invalid proposal ID");
      }

      if (vote !== 0 && vote !== 1)
        throw new Error("Vote must be 0 (reject) or 1 (approve)");

      if (!isConnected) {
        throw new Error("Please connect your wallet to vote");
      }

      if (typeof window.ethereum === "undefined") {
        throw new Error("MetaMask is not installed");
      }

      try {
        // Validate contract address
        if (
          !contracts.governor.address ||
          contracts.governor.address ===
            "0x0000000000000000000000000000000000000000"
        ) {
          throw new Error(
            "Governor contract address is not configured. Please set VITE_GOVERNOR_CONTRACT_ADDRESS in your .env file"
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
        const governorContract = new ethers.Contract(
          contracts.governor.address,
          contracts.governor.abi,
          signer
        );

        // Convert proposalId to BigInt
        const proposalIdBigInt = BigInt(
          typeof proposalId === "string" ? proposalId : proposalId.toString()
        );

        // Cast vote: support is 0 for Against, 1 for For
        const tx = await governorContract.castVote(proposalIdBigInt, vote);

        // Wait for transaction confirmation
        const receipt = await tx.wait();

        // After successful on-chain vote, also send to backend
        try {
          // Send proposalId as string (the large BigInt number as string)
          // and vote as "1" for approve or "0" for reject
          const proposalIdStr = String(proposalId);

          await voteProposal({
            proposalId: proposalIdStr,
            vote: vote === 1 ? "1" : "0",
          });
        } catch (backendError) {
          // Log backend error but don't fail the whole operation
          // since on-chain vote was successful
          console.error("Failed to sync vote to backend:", backendError);
          // Optionally show a warning toast
          toast.warning(
            "Vote recorded on-chain, but failed to sync with backend. Please refresh the page."
          );
        }

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
          error instanceof Error ? error.message : "Failed to vote on proposal";
        throw new Error(errorMessage);
      }
    },
    onSuccess: (_, variables) => {
      toast.success(
        `Voted ${variables.vote === 1 ? "approve" : "reject"} on proposal`
      );
      // Invalidate and refetch proposals after voting
      queryClient.invalidateQueries({ queryKey: ["proposals"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to vote on proposal");
    },
  });
}
