import { useQuery } from "@tanstack/react-query";
import { ethers } from "ethers";
import { contracts } from "@/lib/contracts";

export interface OnChainProposalData {
  state: number; // ProposalState enum (0=Pending, 1=Active, 2=Canceled, 3=Defeated, 4=Succeeded, 5=Queued, 6=Expired, 7=Executed)
  stateName: string;
  forVotes: string;
  againstVotes: string;
  abstainVotes: string;
}

// ProposalState enum values
const PROPOSAL_STATES = [
  "Pending",
  "Active",
  "Canceled",
  "Defeated",
  "Succeeded",
  "Queued",
  "Expired",
  "Executed",
];

export function useProposalOnChain(
  proposalId: string | number | null | undefined
) {
  return useQuery({
    queryKey: ["proposalOnChain", proposalId],
    queryFn: async (): Promise<OnChainProposalData | null> => {
      if (!proposalId || typeof window.ethereum === "undefined") {
        return null;
      }

      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const governorContract = new ethers.Contract(
          contracts.governor.address,
          contracts.governor.abi,
          provider
        );

        // Convert proposalId to BigInt
        const proposalIdBigInt = BigInt(
          typeof proposalId === "string" ? proposalId : proposalId.toString()
        );

        // Fetch proposal state and votes in parallel
        const [state, votes] = await Promise.all([
          governorContract.state(proposalIdBigInt),
          governorContract.proposalVotes(proposalIdBigInt),
        ]);

        const stateNumber = Number(state);
        const stateName = PROPOSAL_STATES[stateNumber] || "Unknown";

        return {
          state: stateNumber,
          stateName,
          forVotes: ethers.formatEther(votes.forVotes),
          againstVotes: ethers.formatEther(votes.againstVotes),
          abstainVotes: ethers.formatEther(votes.abstainVotes),
        };
      } catch (error) {
        console.error("Error fetching on-chain proposal data:", error);
        // If proposal doesn't exist on-chain, return null
        return null;
      }
    },
    enabled: !!proposalId,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}
