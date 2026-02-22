import { type OrderStatus } from "@/lib/db";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold text-white",
        STATUS_COLORS[status],
        className
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
