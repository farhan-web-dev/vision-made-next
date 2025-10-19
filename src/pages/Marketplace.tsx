import { useState } from "react";
import { Search, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import StatusBadge from "@/components/StatusBadge";
import { toast } from "sonner";

const categories = ["All", "NBA", "Football", "NFL", "Esports", "Baseball", "Hockey"];

const reports = [
  {
    id: 1,
    title: "Advanced NBA Player Analytics",
    author: "DataDunkers",
    price: 1500,
    image: "🏀",
    status: "validated" as const,
  },
  {
    id: 2,
    title: "Premier League Expected Goals",
    author: "FootyForecasts",
    price: 1200,
    image: "⚽",
    status: "validated" as const,
  },
  {
    id: 3,
    title: "NFL Draft Prospects Analysis",
    author: "GridironGuru",
    price: 1800,
    image: "🏈",
    status: "pending" as const,
  },
  {
    id: 4,
    title: "MLB Hitting Trends",
    author: "DiamondData",
    price: 1400,
    image: "⚾",
    status: "validated" as const,
  },
];

const Marketplace = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const handleBuy = (reportTitle: string) => {
    toast.success(`Purchased: ${reportTitle}`);
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

      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            onClick={() => setSelectedCategory(category)}
            className="whitespace-nowrap"
          >
            {category}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => (
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
                <Button onClick={() => handleBuy(report.title)}>Buy</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Marketplace;
