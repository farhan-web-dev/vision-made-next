import { Clock, TrendingUp, TrendingDown, UserCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import StatusBadge from "@/components/StatusBadge";
import { toast } from "sonner";
import { useWallet } from "@/contexts/WalletContext";
import { useTokenBalance } from "@/hooks/use-token-balance";
import { useDelegationStatus } from "@/hooks/use-delegation-status";
import { useDelegateVote } from "@/hooks/use-delegate-vote";
import { useProposals } from "@/hooks/use-proposals";
import { useState, useMemo } from "react";

const Governance = () => {
  const { address, isConnected, connectWallet } = useWallet();
  const { data: tokenBalance, isLoading: isLoadingBalance } = useTokenBalance();
  const { data: delegationStatus, isLoading: isLoadingDelegation } = useDelegationStatus();
  const delegateMutation = useDelegateVote();
  const { data: proposalsResponse, isLoading: isLoadingProposals } = useProposals();
  const [filter, setFilter] = useState<"all" | "created" | "bought">("all");

  const proposals = Array.isArray(proposalsResponse) ? proposalsResponse : proposalsResponse?.data || [];

  const filteredProposals = useMemo(() => {
    return proposals.filter((p: any) => {
      const creator = p.reportId?.creator || p.author || "";
      const isCreator = address && creator.toLowerCase() === address.toLowerCase();
      // Since there is no off-chain indexer for on-chain NFT purchases yet, 
      // we check for a hypothetical buyer field. If missing, it defaults to false.
      const isBuyer = address && p.reportId?.buyer?.toLowerCase() === address.toLowerCase();

      if (filter === "all") return true;
      if (filter === "created") return isCreator;
      if (filter === "bought") return isBuyer;
      return true;
    });
  }, [proposals, filter, address]);

  const handleDelegate = () => {
    if (!isConnected) {
      connectWallet();
      return;
    }
    delegateMutation.mutate();
  };

  const formatBalance = (balance: string | null | undefined) => {
    if (!balance) return "0";
    const num = parseFloat(balance);
    if (num >= 1000000) {
      return (num / 1000000).toFixed(2) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(2) + "K";
    }
    return parseFloat(balance).toLocaleString(undefined, {
      maximumFractionDigits: 2,
    });
  };

  const isDelegated = delegationStatus?.isDelegated ?? false;
  const showDelegateButton = isConnected && !isDelegated && !isLoadingDelegation;

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Governance</h1>
        <p className="text-muted-foreground">
          Track DAO decisions and manage your voting power
        </p>
      </div>

      <div className="mb-8 p-6 bg-card/40 backdrop-blur-md rounded-lg border border-border/50 shadow-[0_0_15px_rgba(0,255,255,0.05)] transition-all hover:shadow-[0_0_20px_rgba(0,255,255,0.1)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Available Voting Power</h2>
            <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              {isLoadingBalance
                ? "Loading..."
                : `${formatBalance(tokenBalance)} $FANSTOKEN`}
            </div>
          </div>
          {showDelegateButton && (
            <Button
              onClick={handleDelegate}
              disabled={delegateMutation.isPending}
              className="gap-2"
            >
              <UserCheck className="h-4 w-4" />
              {delegateMutation.isPending ? "Delegating..." : "Delegate Vote"}
            </Button>
          )}
        </div>
        {isDelegated && (
          <p className="text-sm text-muted-foreground">
            ✓ You have delegated your voting power
            {delegationStatus?.delegatee && (
              <span className="ml-1 font-mono text-xs">
                ({delegationStatus.delegatee.slice(0, 6)}...
                {delegationStatus.delegatee.slice(-4)})
              </span>
            )}
          </p>
        )}
        {!isConnected && (
          <p className="text-sm text-muted-foreground">
            Connect your wallet to see your token balance and delegate voting
            power
          </p>
        )}
      </div>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold">Proposal History</h2>
          <div className="flex gap-2">
            <Button size="sm" variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>All</Button>
            <Button size="sm" variant={filter === "created" ? "default" : "outline"} onClick={() => setFilter("created")}>Created by Me</Button>
            <Button size="sm" variant={filter === "bought" ? "default" : "outline"} onClick={() => setFilter("bought")}>Purchased</Button>
          </div>
        </div>

        {isLoadingProposals ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredProposals.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No proposals found matching this filter.</p>
        ) : (
          filteredProposals.map((p: any) => {
            const proposalId = p.id ?? p.proposalId ?? Math.random();
            const title = p.reportId?.title || p.title || `Proposal #${p.proposalId}`;
            const description = p.description || "No description provided.";
            const votesFor = p.votesFor || 0;
            const votesAgainst = p.votesAgainst || 0;
            const totalVotes = votesFor + votesAgainst;
            
            return (
              <Card key={proposalId} className="border-border/50 bg-card/40 backdrop-blur-md transition-all hover:shadow-[0_0_15px_rgba(0,255,255,0.1)] hover:-translate-y-1">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="mb-2">{title}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {description}
                      </p>
                    </div>
                    <StatusBadge status={p.status || "Unknown"} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2 text-sm">
                      <div className="flex items-center gap-2 text-success">
                        <TrendingUp className="h-4 w-4" />
                        <span>Yes (Voters): {votesFor.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-destructive">
                        <TrendingDown className="h-4 w-4" />
                        <span>No (Voters): {votesAgainst.toLocaleString()}</span>
                      </div>
                    </div>
                    <Progress value={totalVotes > 0 ? (votesFor / totalVotes) * 100 : 0} className="h-2" />
                    <div className="mt-2 text-sm text-muted-foreground">
                      Total Voters: {totalVotes.toLocaleString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Governance;
