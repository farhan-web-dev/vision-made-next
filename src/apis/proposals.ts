const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

export interface Proposal {
  id: number;
  title: string;
  description: string;
  status: "active" | "pending" | "completed" | "rejected";
  votesFor: number;
  votesAgainst: number;
  quorum?: number;
  timeLeft?: string;
  author?: string;
  date?: string;
  category?: string;
  upvotes?: number;
  comments?: number;
}

export interface GetAllProposalsResponse {
  success: boolean;
  data?: Proposal[];
  message?: string;
}

export interface VoteProposalRequest {
  proposalId: string; // Large number as string
  vote: "0" | "1"; // "1" for approve, "0" for reject
}

export interface VoteProposalResponse {
  success: boolean;
  data?: any;
  message?: string;
}

export const getAllProposals = async (): Promise<GetAllProposalsResponse> => {
  const response = await fetch(`${API_BASE_URL}/proposals/all-proposals`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: "Failed to fetch proposals",
    }));
    throw new Error(errorData.message || "Failed to fetch proposals");
  }

  const data = await response.json();
  console.log(data);

  return data;
};

export const voteProposal = async (
  data: VoteProposalRequest
): Promise<VoteProposalResponse> => {
  const response = await fetch(`${API_BASE_URL}/proposals/vote`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: "Failed to vote on proposal",
    }));
    throw new Error(errorData.message || "Failed to vote on proposal");
  }

  return response.json();
};
