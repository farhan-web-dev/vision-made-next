const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

export interface CreateReportRequest {
  creator: string;
  title: string;
  description: string;
  file: File;
}

export interface CreateReportResponse {
  success: boolean;
  data?: any;
  message?: string;
}

export const createReport = async (
  data: CreateReportRequest
): Promise<CreateReportResponse> => {
  const formData = new FormData();
  formData.append("creator", data.creator);
  formData.append("title", data.title);
  formData.append("description", data.description);
  formData.append("file", data.file);

  const response = await fetch(`${API_BASE_URL}/reports/createReport`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: "Failed to create report",
    }));
    throw new Error(errorData.message || "Failed to create report");
  }

  return response.json();
};
