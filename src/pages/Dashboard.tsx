import { ArrowUpRight, Plus, TrendingUp, Upload as UploadIcon, CheckCircle, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useWallet } from "@/contexts/WalletContext";
import { useTokenBalance } from "@/hooks/use-token-balance";
import { useProposals } from "@/hooks/use-proposals";
import { useMemo } from "react";

const tokenData = [
  { month: "Jan", tokens: 1400 },
  { month: "Feb", tokens: 1600 },
  { month: "Mar", tokens: 1850 },
  { month: "Apr", tokens: 1700 },
  { month: "May", tokens: 2100 },
  { month: "Jun", tokens: 2300 },
];

const Dashboard = () => {
  const { address, isConnected } = useWallet();
  const { data: tokenBalance } = useTokenBalance();
  const { data: proposalsResponse } = useProposals();

  const proposals = Array.isArray(proposalsResponse)
    ? proposalsResponse
    : proposalsResponse?.data || [];

  const formatBalance = (balance: string | null | undefined) => {
    if (!balance) return "0.00";
    return parseFloat(balance).toLocaleString(undefined, {
      maximumFractionDigits: 2,
    });
  };

  const formattedBalance = formatBalance(tokenBalance);

  const stats = useMemo(() => {
    let uploaded = 0;
    let earned = 0;
    let platformValidated = 0;

    proposals.forEach((p: any) => {
      const creator = p.reportId?.creator || p.author || "";
      const isCreator = address && creator.toLowerCase() === address.toLowerCase();

      if (isCreator) {
        uploaded++;
        if ((p.status || "").toLowerCase() === "executed") {
          const price = p.price || p.reportId?.price || 0;
          earned += parseFloat(price);
        }
      }

      if ((p.status || "").toLowerCase() === "executed") {
        platformValidated++;
      }
    });

    return { uploaded, earned, platformValidated };
  }, [proposals, address]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Track your contributions and earnings</p>
      </div>

      {/* Balance Card */}
      <Card className="mb-8 bg-gradient-to-br from-primary/80 to-accent/80 text-white border-white/10 shadow-[0_0_30px_rgba(0,255,255,0.2)] backdrop-blur-xl transition-all hover:scale-[1.02]">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5" />
              <span className="text-sm opacity-90">Total Balance</span>
            </div>
            <Button size="sm" variant="secondary" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Funds
            </Button>
          </div>
          <div>
            <div className="text-4xl font-bold mb-1">
              {isConnected ? `${formattedBalance} $FANSTOKEN` : "Connect Wallet"}
            </div>
            <div className="text-sm opacity-75">
              {isConnected ? "Real-time balance" : "to view your balance"}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contributions */}
      <Card className="mb-8 border-border/50 bg-card/40 backdrop-blur-md transition-all hover:shadow-[0_0_15px_rgba(0,255,255,0.1)] hover:-translate-y-1">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Your Contributions</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <UploadIcon className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Reports Uploaded</span>
              </div>
              <span className="text-sm font-bold">{stats.uploaded} Total</span>
            </div>
            <Progress value={Math.min(100, stats.uploaded * 10)} className="h-2" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span className="text-sm font-medium">Platform Validated Reports</span>
              </div>
              <span className="text-sm font-bold">{stats.platformValidated} Total</span>
            </div>
            <Progress value={Math.min(100, stats.platformValidated * 5)} className="h-2" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-warning" />
                <span className="text-sm font-medium">Tokens Earned (from reports)</span>
              </div>
              <span className="text-sm font-bold">{stats.earned.toLocaleString()} $FANSTOKEN</span>
            </div>
            <Progress value={Math.min(100, (stats.earned / 5000) * 100)} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Token Transactions Chart */}
      <Card className="border-border/50 bg-card/40 backdrop-blur-md transition-all hover:shadow-[0_0_15px_rgba(0,255,255,0.1)] hover:-translate-y-1">
        <CardHeader>
          <CardTitle>Platform Token Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={tokenData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
              <Line
                type="monotone"
                dataKey="tokens"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
