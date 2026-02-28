import { useMutation } from "@tanstack/react-query";
import { createReport, CreateReportRequest } from "@/apis/reports";
import { toast } from "sonner";

export const useCreateReport = () => {
  return useMutation({
    mutationFn: (data: CreateReportRequest) => createReport(data),
    onSuccess: () => {
      toast.success("Report created successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create report");
    },
  });
};
