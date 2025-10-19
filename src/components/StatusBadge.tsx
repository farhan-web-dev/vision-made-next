import { Badge } from "./ui/badge";

interface StatusBadgeProps {
  status: "validated" | "pending" | "rejected" | "active";
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const config = {
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
  };

  const { label, className } = config[status];

  return <Badge className={className}>{label}</Badge>;
};

export default StatusBadge;
