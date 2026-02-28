import { Clock, TrendingUp, TrendingDown, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import StatusBadge from "@/components/StatusBadge";
import { toast } from "sonner";
import { useWallet } from "@/contexts/WalletContext";
import { useTokenBalance } from "@/hooks/use-token-balance";
import { useDelegationStatus } from "@/hooks/use-delegation-status";
import { useDelegateVote } from "@/hooks/use-delegate-vote";

const proposals = [
  {
    id: 1,
    title: "Integrate FanForge with Chainlink Oracles",
    description:
      "Proposal to integrate Chainlink Sports data oracles for enhanced report validation accuracy and...",
    status: "active" as const,
    votesFor: 72000,
    votesAgainst: 18000,
    quorum: 80,
    timeLeft: "2 days left",
  },
  {
    id: 2,
    title: "Increase $FANSTOKEN Staking Rewards",
    description:
      "Adjust the staking reward parameters to incentivize long-term token holding and governance participation.",
    status: "active" as const,
    votesFor: 45000,
    votesAgainst: 15000,
    quorum: 60,
    timeLeft: "5 days left",
  },
];

const Governance = () => {
  const { address, isConnected, connectWallet } = useWallet();
  const { data: tokenBalance, isLoading: isLoadingBalance } = useTokenBalance();
  const { data: delegationStatus, isLoading: isLoadingDelegation } =
    useDelegationStatus();
  const delegateMutation = useDelegateVote();

  const handleVote = (proposalTitle: string, vote: "approve" | "reject") => {
    toast.success(`Voted to ${vote} proposal`);
  };

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
  const showDelegateButton =
    isConnected && !isDelegated && !isLoadingDelegation;

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Governance</h1>
        <p className="text-muted-foreground">
          Participate in community governance by voting on proposals
        </p>
      </div>

      <div className="mb-8 p-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Available Voting Power</h2>
            <div className="text-4xl font-bold text-primary">
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
        <h2 className="text-2xl font-bold">Active Proposals</h2>

        {proposals.map((proposal) => (
          <Card key={proposal.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="mb-2">{proposal.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {proposal.description}
                  </p>
                </div>
                <StatusBadge status={proposal.status} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2 text-sm">
                  <div className="flex items-center gap-2 text-success">
                    <TrendingUp className="h-4 w-4" />
                    <span>Yes ({proposal.votesFor.toLocaleString()})</span>
                  </div>
                  <div className="flex items-center gap-2 text-destructive">
                    <TrendingDown className="h-4 w-4" />
                    <span>No ({proposal.votesAgainst.toLocaleString()})</span>
                  </div>
                </div>
                <Progress value={proposal.quorum} className="h-2" />
                <div className="mt-2 text-sm text-muted-foreground">
                  Votes:{" "}
                  {(proposal.votesFor + proposal.votesAgainst).toLocaleString()}{" "}
                  ({proposal.votesFor.toLocaleString()} Yes,{" "}
                  {proposal.votesAgainst.toLocaleString()} No)
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Quorum: Reached • {proposal.quorum}%
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Time Left: {proposal.timeLeft}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleVote(proposal.title, "reject")}
                  >
                    Reject
                  </Button>
                  <Button onClick={() => handleVote(proposal.title, "approve")}>
                    Approve
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Governance;
