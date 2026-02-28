import { useQuery } from "@tanstack/react-query";
import { getAllProposals } from "@/apis/proposals";

export const useProposals = () => {
  return useQuery({
    queryKey: ["proposals"],
    queryFn: () => getAllProposals(),
  });
};
