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
  activeAction,
}: {
  proposal: Proposal & { proposalId?: string | number; price?: string | number; reportId?: { price?: string | number } };
  proposalId: string | number;
  voteMutation: ReturnType<typeof useVoteProposal>;
  handleVote: (proposalId: string | number, vote: number) => void;
  activeAction: { id: string | number; vote: number } | null;
}) {
  return (
    <Card className="p-6 border-border/50 bg-card/90 transition-all hover:shadow-[0_0_15px_rgba(0,255,255,0.1)] hover:-translate-y-1">
      <div className="flex items-start gap-4 mb-4">
        <Avatar>
          <AvatarFallback>
            {typeof p?.author === "string" && p.author.length > 0
              ? p.author
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
              : "P"}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <h2 className="text-xl font-semibold">{p?.reportId?.title || p?.title || "Unknown Title"}</h2>
          {(p?.price || p?.reportId?.price) && (
            <div className="text-sm font-semibold text-primary mt-1">
              Price: {p?.price || p?.reportId?.price} $FANSTOKEN
            </div>
          )}
          <p className="text-sm text-muted-foreground mt-1">{p?.description}</p>

          {typeof p?.reportId?.fileIpfsHash === "string" && (() => {
            const cleanHash = p.reportId.fileIpfsHash.replace("ipfs://", "");
            return (
              <div className="mt-4 p-4 border border-border/50 rounded-lg bg-background/50 flex flex-col items-center justify-center gap-2">
                <p className="text-sm font-medium text-muted-foreground">Document attached via IPFS</p>
                <a 
                  href={`https://ipfs.io/ipfs/${cleanHash}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
                >
                  View Full Document ↗
                </a>
              </div>
            );
          })()}

          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary">{p?.status}</Badge>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6 text-sm mt-4 mb-4 text-muted-foreground">
        <div className="flex items-center gap-1">
          <TrendingUp className="h-4 w-4 text-green-500" />
          Yes (Voters): {p?.votesFor || 0}
        </div>

        <div className="flex items-center gap-1">
          <TrendingDown className="h-4 w-4 text-red-500" />
          No (Voters): {p?.votesAgainst || 0}
        </div>
      </div>

      <ProposalOnChainData proposalId={proposalId} />

      {(p?.status === "Active" || p?.status === "active") && (
        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            className="flex-1"
            disabled={voteMutation.isPending}
            onClick={() => handleVote(proposalId, 0)}
          >
            {voteMutation.isPending && activeAction?.id === proposalId && activeAction?.vote === 0 ? "Processing..." : "Reject"}
          </Button>

          <Button
            className="flex-1"
            disabled={voteMutation.isPending}
            onClick={() => handleVote(proposalId, 1)}
          >
            {voteMutation.isPending && activeAction?.id === proposalId && activeAction?.vote === 1 ? "Processing..." : "Approve"}
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
  const [activeAction, setActiveAction] = useState<{ id: string | number; vote: number } | null>(null);

  // Handle both response structure and direct array
  const rawProposals = Array.isArray(proposalsResponse)
    ? proposalsResponse
    : proposalsResponse?.data || [];

  const proposals = rawProposals.filter((p: any) => p?.status === "Active" || p?.status === "active");

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
    
    setActiveAction({ id: proposalId, vote });

    voteMutation.mutate(
      { proposalId, vote },
      {
        onError: (err) => {
          setError(err.message);
          setActiveAction(null);
        },
        onSuccess: () => {
          setError("");
          setActiveAction(null);
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
        proposals.map((p, index) => {
          // Handle both 'id' and 'proposalId' field names safely
          const proposalId = p?._id ?? p?.id ?? p?.proposalId ?? `fallback-${index}`;

          return (
            <ProposalCard
              key={proposalId}
              proposal={p}
              proposalId={proposalId}
              voteMutation={voteMutation}
              handleVote={handleVote}
              activeAction={activeAction}
            />
          );
        })
      )}
    </div>
  );
}
