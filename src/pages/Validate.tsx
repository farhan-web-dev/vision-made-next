import { ThumbsUp, MessageSquare, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const reports = [
  {
    id: 1,
    author: "Ethan Hunt",
    date: "2024-07-20",
    category: "Basketball",
    title: "Advanced Defensive Metrics in Basketball",
    description: "An in-depth analysis of new defensive metrics and their impact on team success in the NBA for...",
    upvotes: 124,
    comments: 18,
    status: "pending",
  },
  {
    id: 2,
    author: "Sophia Lee",
    date: "2024-07-19",
    category: "Football",
    title: "Expected Goals Model for European Football",
    description: "Development of a refined Expected Goals (xG) model for top 5 European football leagues, with...",
    upvotes: 98,
    comments: 12,
    status: "pending",
  },
];

const Validate = () => {
  const handleAction = (action: string, reportId: number) => {
    toast.success(`Report ${action}!`);
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Community Validation</h1>
        <p className="text-muted-foreground">
          Review and contribute to the validation of sports analytics reports uploaded by the FanForge community.
        </p>
      </div>

      <div className="space-y-6">
        {reports.map((report) => (
          <Card key={report.id} className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <Avatar>
                <AvatarFallback>{report.author.split(" ").map(n => n[0]).join("")}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">{report.author}</h3>
                  <span className="text-sm text-muted-foreground">{report.date}</span>
                </div>
                <Badge variant="secondary" className="bg-success/10 text-success hover:bg-success/20">
                  {report.category}
                </Badge>
              </div>
            </div>

            <div className="mb-4">
              <h2 className="text-xl font-bold mb-2">{report.title}</h2>
              <p className="text-muted-foreground">{report.description}</p>
            </div>

            <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <ThumbsUp className="h-4 w-4" />
                <span>{report.upvotes}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                <span>{report.comments}</span>
              </div>
            </div>

            {report.status === "pending" && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleAction("upvoted", report.id)}
                >
                  Upvote
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleAction("reviewed", report.id)}
                >
                  Review
                </Button>
                <Button
                  className="flex-1 gap-2"
                  onClick={() => handleAction("approved", report.id)}
                >
                  <CheckCircle className="h-4 w-4" />
                  Approve
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Validate;
