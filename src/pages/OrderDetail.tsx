import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Edit, Trash2, User, Ruler, Palette, Scissors, Hash, Calendar, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOrder, deleteOrder, updateOrder } from "@/hooks/useOrders";
import { StatusBadge } from "@/components/StatusBadge";
import { CATEGORY_EMOJI, CATEGORY_LABELS, STATUS_LABELS, formatCurrency, formatDate, daysUntil } from "@/lib/constants";
import { type OrderStatus } from "@/lib/db";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function OrderDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const order = useOrder(id ? Number(id) : undefined);

  if (!order) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  const remaining = order.totalAmount - order.receivedAmount;
  const days = daysUntil(order.deadlineDate);

  const handleDelete = async () => {
    await deleteOrder(order.id!);
    toast.success("Commande supprimée");
    navigate("/");
  };

  const handleStatusChange = async (newStatus: OrderStatus) => {
    await updateOrder(order.id!, { status: newStatus });
    toast.success(`Statut mis à jour : ${STATUS_LABELS[newStatus]}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-card/80 backdrop-blur-md">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-display text-lg font-semibold text-foreground">Détail</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={() => navigate(`/order/${order.id}`)}>
              <Edit className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="icon" className="text-destructive hover:bg-destructive hover:text-destructive-foreground">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Supprimer cette commande ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action est irréversible. La commande sera définitivement supprimée.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                    Supprimer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </header>

      <main className="container space-y-4 py-4 pb-24">
        {/* Title card */}
        <div className="rounded-lg border bg-card p-5 animate-slide-up">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{CATEGORY_EMOJI[order.category]}</span>
                <h2 className="font-display text-xl font-bold text-foreground">{order.articleName}</h2>
              </div>
              <p className="text-sm text-muted-foreground">{CATEGORY_LABELS[order.category]}</p>
            </div>
            <StatusBadge status={order.status} />
          </div>
          {order.description && (
            <p className="mt-3 text-sm text-muted-foreground">{order.description}</p>
          )}
        </div>

        {/* Quick status change */}
        <div className="rounded-lg border bg-card p-4">
          <p className="mb-2 text-sm font-medium text-foreground">Changer le statut</p>
          <Select value={order.status} onValueChange={(v) => handleStatusChange(v as OrderStatus)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {(Object.keys(STATUS_LABELS) as OrderStatus[]).map((s) => (
                <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Details grid */}
        <div className="rounded-lg border bg-card p-4 space-y-3">
          <h3 className="font-display font-semibold text-foreground">Informations</h3>
          <DetailRow icon={<User className="h-4 w-4" />} label="Client" value={order.clientName} />
          <DetailRow icon={<Ruler className="h-4 w-4" />} label="Taille" value={order.size || "—"} />
          <DetailRow icon={<Palette className="h-4 w-4" />} label="Couleur" value={order.color || "—"} />
          <DetailRow icon={<Scissors className="h-4 w-4" />} label="Tissu" value={order.fabricType || "—"} />
          <DetailRow icon={<Hash className="h-4 w-4" />} label="Quantité" value={String(order.quantity)} />
          <DetailRow icon={<Calendar className="h-4 w-4" />} label="Enregistré" value={formatDate(order.createdAt)} />
          <DetailRow
            icon={<Calendar className="h-4 w-4" />}
            label="Date de besoin"
            value={formatDate(order.deadlineDate)}
            extra={
              days <= 1 && order.status !== "livre" && order.status !== "vendu"
                ? days === 0
                  ? "Aujourd'hui !"
                  : days < 0
                  ? `${Math.abs(days)}j de retard`
                  : "Demain !"
                : undefined
            }
          />
        </div>

        {/* Payment */}
        <div className="rounded-lg border bg-card p-4 space-y-3">
          <h3 className="font-display font-semibold text-foreground">Paiement</h3>
          <DetailRow icon={<CreditCard className="h-4 w-4" />} label="Total" value={formatCurrency(order.totalAmount)} />
          <DetailRow icon={<CreditCard className="h-4 w-4" />} label="Reçu" value={formatCurrency(order.receivedAmount)} />
          <div className="flex justify-between border-t pt-2">
            <span className="text-sm font-medium text-foreground">Restant</span>
            <span className={remaining > 0 ? "font-bold text-destructive" : "font-bold text-status-delivered"}>
              {formatCurrency(remaining)}
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}

function DetailRow({ icon, label, value, extra }: { icon: React.ReactNode; label: string; value: string; extra?: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-right">
        <span className="font-medium text-foreground">{value}</span>
        {extra && <span className="ml-1 text-xs font-semibold text-destructive">{extra}</span>}
      </div>
    </div>
  );
}
