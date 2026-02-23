import { type Order } from "@/lib/db";
import { StatusBadge } from "./StatusBadge";
import { CATEGORY_EMOJI, formatCurrency, formatDate, daysUntil } from "@/lib/constants";
import { calculateOrderTotal } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { Clock, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface OrderCardProps {
  order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
  const navigate = useNavigate();
  const totalAmount = calculateOrderTotal(order.items);
  const remaining = totalAmount - order.receivedAmount;
  const days = daysUntil(order.deadlineDate);
  const isUrgent = days <= 1 && order.status !== "livre" && order.status !== "vendu";

  // Get first item for display, or show article count
  const firstItem = order.items[0];
  const itemCount = order.items.length;

  return (
    <div
      onClick={() => navigate(`/detail/${order.id}`)}
      className={cn(
        "group cursor-pointer rounded-lg border bg-card p-4 transition-all hover:shadow-md animate-slide-up",
        isUrgent && "border-destructive/50 bg-destructive/5"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {firstItem && <span className="text-lg">{CATEGORY_EMOJI[firstItem.category]}</span>}
            <h3 className="truncate font-display text-base font-semibold text-foreground">
              {firstItem?.articleName || "Article"}
              {itemCount > 1 && <span className="text-xs text-muted-foreground ml-2">+{itemCount - 1}</span>}
            </h3>
          </div>
          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-3 w-3" />
            <span className="truncate">{order.clientName}</span>
          </div>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="mt-3 flex items-center justify-between text-sm">
        <div className="flex items-center gap-1 text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{formatDate(order.deadlineDate)}</span>
          {isUrgent && (
            <span className="ml-1 text-xs font-semibold text-destructive">
              {days === 0 ? "Aujourd'hui !" : days < 0 ? "En retard !" : "Demain !"}
            </span>
          )}
        </div>
        <div className="text-right">
          <span className="font-semibold text-foreground">{formatCurrency(totalAmount)}</span>
          {remaining > 0 && (
            <span className="ml-1 text-xs text-destructive">
              (-{formatCurrency(remaining)})
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
