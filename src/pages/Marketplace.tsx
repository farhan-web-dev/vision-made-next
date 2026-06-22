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

const reportImages = [
  "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1508344928928-7165b67de128?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=800&q=80"
];

const Marketplace = () => {
  const { isConnected, connectWallet, checkNetwork, switchToSepolia } = useWallet();
  const [searchQuery, setSearchQuery] = useState("");
  const [buyingId, setBuyingId] = useState<number | string | null>(null);
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
        title: p.reportId?.title || p.title || `Report #${p.proposalId}`,
        author: p.reportId?.creator || p.author || "Community Member",
        price: p.price || p.reportId?.price || 0,
        image: reportImages[Math.floor(Math.random() * reportImages.length)],
        status: p.status,
        ipfsHash: p.reportId?.fileIpfsHash,
      }));
  }, [proposals]);

  const filteredReports = executedReports.filter((r: any) => 
    r.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBuy = async (reportId: number, reportTitle: string, reportPrice: number, ipfsHash: string) => {
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
      setBuyingId(reportId);
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

      toast.info(`Resolving report on-chain...`);
      let actualReportId = 0n;
      
      try {
        const nextReportId = await marketplaceContract.nextReportId();
        for (let i = 1n; i <= nextReportId; i++) {
          try {
            const uri = await marketplaceContract.tokenURI(i);
            if (uri === ipfsHash) {
              actualReportId = i;
              break;
            }
          } catch (e) {
            // Ignore if token doesn't exist
          }
        }
      } catch (err) {
        console.error("Failed to query marketplace contract:", err);
      }

      if (actualReportId === 0n) {
        toast.error("Report not found on the marketplace contract. Ensure the report is listed.");
        setBuyingId(null);
        return;
      }

      toast.info(`Purchasing report: ${reportTitle}...`);
      const buyTx = await marketplaceContract.buyReport(actualReportId);
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
      setBuyingId(null);
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
          No reports found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report: any) => (
          <Card key={report.id} className="overflow-hidden border-border/50 bg-card/40 backdrop-blur-md transition-all hover:shadow-[0_0_20px_rgba(0,255,255,0.15)] hover:-translate-y-2 group">
            <div className="aspect-video bg-muted overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent z-10" />
              <img src={report.image} alt="Report Cover" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            </div>
            <div className="p-4 relative z-20">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-bold mb-1">{report.title}</h3>
                  <p className="text-sm text-muted-foreground">{report.author}</p>
                </div>
                <StatusBadge status={report.status} />
              </div>
              
              {report.ipfsHash && (() => {
                const cleanHash = report.ipfsHash.replace("ipfs://", "");
                return (
                  <div className="mt-2 mb-2">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Document Snippet:</p>
                    <iframe 
                      src={`https://ipfs.io/ipfs/${cleanHash}`} 
                      className="w-full h-24 border rounded-md" 
                      title="Uploaded Document"
                    />
                    <a 
                      href={`https://ipfs.io/ipfs/${cleanHash}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-xs text-blue-500 hover:underline mt-1 inline-block"
                    >
                      Open full document ↗
                    </a>
                  </div>
                );
              })()}

              <div className="flex items-center justify-between mt-4">
                <div>
                  <div className="flex items-center gap-1 text-primary font-bold">
                    <DollarSign className="h-4 w-4" />
                    <span>{report.price.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">FANSTOKEN</p>
                </div>
                <Button 
                  onClick={() => handleBuy(report.id, report.title, report.price, report.ipfsHash)}
                  disabled={buyingId !== null}
                >
                  {buyingId === report.id ? (
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
