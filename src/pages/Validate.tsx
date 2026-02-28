"use client";

import {
  ThumbsUp,
  MessageSquare,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

import { useProposals } from "@/hooks/use-proposals";
import { useVoteProposal } from "@/hooks/use-vote-proposal";
import { useWallet } from "@/contexts/WalletContext";
import { useProposalOnChain } from "@/hooks/use-proposal-onchain";
import { Proposal } from "@/apis/proposals";
import { useState } from "react";

// Component to display on-chain proposal data
function ProposalOnChainData({ proposalId }: { proposalId: string | number }) {
  const { data: onChainData, isLoading: isLoadingOnChain } =
    useProposalOnChain(proposalId);

  if (isLoadingOnChain) {
    return (
      <div className="mt-3 p-3 bg-muted rounded-lg border">
        <p className="text-xs text-muted-foreground">
          Loading on-chain data...
        </p>
      </div>
    );
  }

  if (!onChainData) {
    return null;
  }

  return (
    <div className="mt-3 p-3 bg-muted rounded-lg border">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-muted-foreground">
          On-Chain Status:
        </span>
        <Badge variant="outline" className="text-xs">
          {onChainData.stateName}
        </Badge>
      </div>
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1">
          <TrendingUp className="h-3 w-3 text-green-500" />
          <span className="font-medium">
            For:{" "}
            {parseFloat(onChainData.forVotes).toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <TrendingDown className="h-3 w-3 text-red-500" />
          <span className="font-medium">
            Against:{" "}
            {parseFloat(onChainData.againstVotes).toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
      </div>
    </div>
  );
}

// Proposal card component
function ProposalCard({
  proposal: p,
  proposalId,
  voteMutation,
  handleVote,
}: {
  proposal: Proposal & { proposalId?: string | number };
  proposalId: string | number;
  voteMutation: ReturnType<typeof useVoteProposal>;
  handleVote: (proposalId: string | number, vote: number) => void;
}) {
  return (
    <Card className="p-6">
      <div className="flex items-start gap-4 mb-4">
        <Avatar>
          <AvatarFallback>
            {p.author
              ? p.author
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
              : "P"}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <h2 className="text-xl font-semibold">{p.title}</h2>
          <p className="text-sm text-muted-foreground mt-1">{p.description}</p>

          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary">{p.status}</Badge>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6 text-sm mt-4 mb-4 text-muted-foreground">
        <div className="flex items-center gap-1">
          <TrendingUp className="h-4 w-4 text-green-500" />
          Yes: {p.votesFor || 0}
        </div>

        <div className="flex items-center gap-1">
          <TrendingDown className="h-4 w-4 text-red-500" />
          No: {p.votesAgainst || 0}
        </div>
      </div>

      <ProposalOnChainData proposalId={proposalId} />

      {(p.status === "Active" || p.status === "Pending") && (
        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            className="flex-1"
            disabled={voteMutation.isPending}
            onClick={() => handleVote(proposalId, 0)}
          >
            Reject
          </Button>

          <Button
            className="flex-1"
            disabled={voteMutation.isPending}
            onClick={() => handleVote(proposalId, 1)}
          >
            Approve
          </Button>
        </div>
      )}
    </Card>
  );
}

export default function Validate() {
  const { address } = useWallet();
  const { data: proposalsResponse, isLoading } = useProposals();
  console.log(proposalsResponse);
  const voteMutation = useVoteProposal();

  const [error, setError] = useState("");

  // Handle both response structure and direct array
  const proposals = Array.isArray(proposalsResponse)
    ? proposalsResponse
    : proposalsResponse?.data || [];

  const handleVote = (proposalId: string | number, vote: number) => {
    console.log("Voting on proposal:", { proposalId, vote });
    if (!address) {
      setError("Please connect your wallet to vote.");
      return;
    }

    // Validate proposalId before calling
    if (proposalId === undefined || proposalId === null || proposalId === "") {
      setError("Invalid proposal ID");
      return;
    }

    console.log("Voting on proposal:", { proposalId, vote });

    voteMutation.mutate(
      { proposalId, vote },
      {
        onError: (err) => {
          setError(err.message);
        },
        onSuccess: () => {
          setError("");
        },
      }
    );
  };

  if (isLoading)
    return (
      <div className="p-8 text-center text-muted-foreground">
        Loading proposals...
      </div>
    );

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold mb-2">Community Voting</h1>
      <p className="text-muted-foreground mb-8">
        Vote on reports submitted by the community. Your vote directly affects
        which reports become official analytics NFTs.
      </p>

      {error && <p className="text-red-500 text-center">{error}</p>}

      {proposals.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No proposals available at the moment.
          </p>
        </div>
      ) : (
        proposals.map((p) => {
          // Handle both 'id' and 'proposalId' field names
          const proposalId = p.id ?? p.proposalId;

          return (
            <ProposalCard
              key={proposalId}
              proposal={p}
              proposalId={proposalId}
              voteMutation={voteMutation}
              handleVote={handleVote}
            />
          );
        })
      )}
    </div>
  );
}
