import { Badge } from "./ui/badge";

interface StatusBadgeProps {
  status: "validated" | "pending" | "rejected" | "active" | "executed" | "EXECUTED" | string;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const config: Record<string, { label: string; className: string }> = {
    validated: {
      label: "Validated",
      className: "bg-success text-success-foreground hover:bg-success",
    },
    pending: {
      label: "Pending",
      className: "bg-warning text-warning-foreground hover:bg-warning",
    },
    rejected: {
      label: "Rejected",
      className: "bg-destructive text-destructive-foreground hover:bg-destructive",
    },
    active: {
      label: "Active",
      className: "bg-success text-success-foreground hover:bg-success",
    },
    executed: {
      label: "Executed",
      className: "bg-primary text-primary-foreground hover:bg-primary",
    },
  };

  const normalizedStatus = (status || "").toLowerCase();
  const badgeConfig = config[normalizedStatus] || {
    label: status || "Unknown",
    className: "bg-secondary text-secondary-foreground hover:bg-secondary",
  };

  const { label, className } = badgeConfig;

  return <Badge className={className}>{label}</Badge>;
};

export default StatusBadge;
