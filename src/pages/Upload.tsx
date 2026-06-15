import { useState, useRef } from "react";
import { Upload as UploadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useWallet } from "@/contexts/WalletContext";
import { useCreateReport } from "@/hooks/use-create-report";

const Upload = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { address, isConnected, connectWallet } = useWallet();
  const { mutate: createReport, isPending } = useCreateReport();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const isAllowed = selectedFile.type === "application/pdf" || 
                        selectedFile.type === "text/plain" ||
                        selectedFile.name.toLowerCase().endsWith(".pdf") ||
                        selectedFile.name.toLowerCase().endsWith(".txt");
      if (!isAllowed) {
        toast.error("Please upload a PDF or TXT file only. The AI fact-checking engine is optimized for these formats.");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        setFile(null);
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected || !address) {
      toast.error("Please connect your wallet first");
      await connectWallet();
      return;
    }

    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }

    if (!title || !description) {
      toast.error("Please fill in all required fields");
      return;
    }

    createReport(
      {
        creator: address,
        title,
        description,
        price,
        file,
      },
      {
        onSuccess: () => {
          // Reset form after successful submission
          setTitle("");
          setDescription("");
          setPrice("");
          setFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        },
      }
    );
  };

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Upload Report</h1>
        <p className="text-muted-foreground">
          Share your sports analytics with the community and earn $FANSTOKEN.
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Report Title</Label>
            <Input
              id="title"
              placeholder="e.g., 'Team X Match Analysis 2024'"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Report Description</Label>
            <Textarea
              id="description"
              placeholder="Provide a detailed description of your report's content and methodology."
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price ($FANSTOKEN)</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g., 50"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Upload File</Label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              accept=".pdf,.txt"
            />
            <div
              onClick={handleFileClick}
              className="border-2 border-dashed rounded-lg p-12 text-center hover:border-primary transition-colors cursor-pointer"
            >
              <UploadIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              {file ? (
                <p className="text-sm text-primary mb-2 font-medium">
                  {file.name}
                </p>
              ) : (
                <div className="space-y-1 mb-2">
                  <p className="text-sm text-muted-foreground">
                    Drag and drop your report here, or click to browse
                  </p>
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                    Only PDF and TXT files are supported for AI Fact-Checking verification
                  </p>
                </div>
              )}
              <Button type="button" variant="outline" size="sm">
                {file ? "Change File" : "Choose File"}
              </Button>
            </div>
          </div>

          {!isConnected && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Please connect your wallet to upload a report.
              </p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isPending || !isConnected}
          >
            {isPending ? "Submitting..." : "Submit Report"}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default Upload;
