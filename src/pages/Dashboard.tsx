import { ArrowUpRight, Plus, TrendingUp, Upload as UploadIcon, CheckCircle, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const tokenData = [
  { month: "Jan", tokens: 1400 },
  { month: "Feb", tokens: 1600 },
  { month: "Mar", tokens: 1850 },
  { month: "Apr", tokens: 1700 },
  { month: "May", tokens: 2100 },
  { month: "Jun", tokens: 2300 },
];

const Dashboard = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Track your contributions and earnings</p>
      </div>

      {/* Balance Card */}
      <Card className="mb-8 bg-gradient-to-br from-primary to-accent text-white">
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
            <div className="text-4xl font-bold mb-1">25,300.75 $FANSTOKEN</div>
            <div className="text-sm opacity-75">12,650.38 USD</div>
          </div>
        </CardContent>
      </Card>

      {/* Contributions */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Your Contributions</CardTitle>
            <Button variant="link" className="gap-1">
              View Details <ArrowUpRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <UploadIcon className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Reports Uploaded</span>
              </div>
              <span className="text-sm font-bold">7 / 10</span>
            </div>
            <Progress value={70} className="h-2" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span className="text-sm font-medium">Reports Validated</span>
              </div>
              <span className="text-sm font-bold">15 / 20</span>
            </div>
            <Progress value={75} className="h-2" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-warning" />
                <span className="text-sm font-medium">Tokens Earned</span>
              </div>
              <span className="text-sm font-bold">1,500 / 2,000</span>
            </div>
            <Progress value={75} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Token Transactions Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Token Transactions</CardTitle>
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
