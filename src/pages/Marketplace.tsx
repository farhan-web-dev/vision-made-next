import { useState, useMemo, useEffect } from "react";
import StatusBadge from "@/components/StatusBadge";
import { Search, DollarSign, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useProposals } from "@/hooks/use-proposals";
import { useWallet } from "@/contexts/WalletContext";
import { ethers } from "ethers";
import { contracts } from "@/lib/contracts";

const cricketImages = ["🏏", "🏟️", "🏆", "🏏"];

const Marketplace = () => {
  const { isConnected, connectWallet, checkNetwork, switchToSepolia } = useWallet();
  const [searchQuery, setSearchQuery] = useState("");
  const [isBuying, setIsBuying] = useState(false);
  const { data: proposalsResponse, isLoading } = useProposals();

  const proposals = Array.isArray(proposalsResponse)
    ? proposalsResponse
    : proposalsResponse?.data || [];
    
  // Memoize to avoid image changing on every render 
  const executedReports = useMemo(() => {
    return proposals
      .filter((p: any) => p.status === "EXECUTED" || (p.status || "").toLowerCase() === "executed")
      .map((p: any) => ({
        id: p.id ?? p.proposalId ?? Math.random(),
        title: p.title || `Report #${p.proposalId}`,
        author: p.author || "Community Member",
        price: p.price || p.reportId?.price || 0,
        image: cricketImages[Math.floor(Math.random() * cricketImages.length)],
        status: p.status,
      }));
  }, [proposals]);

  const filteredReports = executedReports.filter((r: any) => 
    r.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBuy = async (reportId: number, reportTitle: string, reportPrice: number) => {
    if (!isConnected) {
      toast.error("Please connect your wallet to purchase");
      await connectWallet();
      return;
    }

    if (typeof window.ethereum === "undefined") {
      toast.error("MetaMask is not installed");
      return;
    }

    try {
      setIsBuying(true);
      const isSepolia = await checkNetwork();
      if (!isSepolia) {
        toast.info("Switching to Sepolia network...");
        await switchToSepolia();
      }

      const provider = new ethers.BrowserProvider(window.ethereum as any);
      const signer = await provider.getSigner();

      // 1. Approve Tokens
      const tokenContract = new ethers.Contract(
        contracts.fansToken.address,
        contracts.fansToken.abi,
        signer
      );

      const priceStr = reportPrice ? reportPrice.toString() : "0";
      const priceInWei = ethers.parseEther(priceStr);
      
      if (priceInWei > 0n) {
        toast.info("Approving tokens for purchase...");
        const approveTx = await tokenContract.approve(contracts.marketplace.address, priceInWei);
        await approveTx.wait();
      }

      // 2. Buy Report
      const marketplaceContract = new ethers.Contract(
        contracts.marketplace.address,
        contracts.marketplace.abi,
        signer
      );

      toast.info(`Purchasing report: ${reportTitle}...`);
      const buyTx = await marketplaceContract.buyReport(BigInt(reportId));
      await buyTx.wait();

      toast.success(`Successfully purchased: ${reportTitle}`);
    } catch (error: any) {
      console.error(error);
      if (error?.code === 4001 || error?.info?.error?.code === 4001) {
        toast.error("Transaction was rejected");
      } else {
        toast.error(error?.reason || error?.message || "Failed to buy report");
      }
    } finally {
      setIsBuying(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Marketplace</h1>
        <p className="text-muted-foreground">
          Browse and purchase validated sports analytics reports from the community
        </p>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reports..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
          <span className="ml-2 text-muted-foreground">Loading reports...</span>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No executed reports found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report: any) => (
          <Card key={report.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-6xl">
              {report.image}
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-bold mb-1">{report.title}</h3>
                  <p className="text-sm text-muted-foreground">{report.author}</p>
                </div>
                <StatusBadge status={report.status} />
              </div>
              <div className="flex items-center justify-between mt-4">
                <div>
                  <div className="flex items-center gap-1 text-primary font-bold">
                    <DollarSign className="h-4 w-4" />
                    <span>{report.price.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">FANSTOKEN</p>
                </div>
                <Button 
                  onClick={() => handleBuy(report.id, report.title, report.price)}
                  disabled={isBuying}
                >
                  {isBuying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing
                    </>
                  ) : (
                    "Buy"
                  )}
                </Button>
              </div>
            </div>
          </Card>
        ))}
        </div>
      )}
    </div>
  );
};

export default Marketplace;
