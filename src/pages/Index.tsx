import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, BarChart3, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOrders, useStats } from "@/hooks/useOrders";
import { OrderCard } from "@/components/OrderCard";
import { type OrderStatus } from "@/lib/db";
import { STATUS_LABELS, formatCurrency } from "@/lib/constants";
import { cn } from "@/lib/utils";

const FILTERS: { value: OrderStatus | "all"; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "nouveau", label: "Nouveau" },
  { value: "en_cours", label: "En cours" },
  { value: "livre", label: "Livré" },
  { value: "vendu", label: "Vendu" },
];

const Index = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [showStats, setShowStats] = useState(false);

  const orders = useOrders(
    filter === "all" ? undefined : filter,
    search
  );
  const stats = useStats();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-card/80 backdrop-blur-md">
        <div className="container flex items-center justify-between py-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Moda<span className="text-primary">Gest</span>
            </h1>
            <p className="text-xs text-muted-foreground">Gestion des commandes</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowStats(!showStats)}
              className={cn(showStats && "bg-primary text-primary-foreground")}
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
            <Button onClick={() => navigate("/order/new")} size="icon">
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container pb-24 pt-4">
        {/* Stats Panel */}
        {showStats && stats && (
          <div className="mb-4 grid grid-cols-2 gap-3 animate-slide-up">
            <div className="rounded-lg bg-card border p-3">
              <p className="text-xs text-muted-foreground">Total commandes</p>
              <p className="text-xl font-bold font-display text-foreground">{stats.totalOrders}</p>
            </div>
            <div className="rounded-lg bg-card border p-3">
              <p className="text-xs text-muted-foreground">Ventes totales</p>
              <p className="text-xl font-bold font-display text-foreground">{formatCurrency(stats.totalSales)}</p>
            </div>
            <div className="rounded-lg bg-card border p-3">
              <p className="text-xs text-muted-foreground">Montant reçu</p>
              <p className="text-xl font-bold font-display text-status-delivered">{formatCurrency(stats.totalReceived)}</p>
            </div>
            <div className="rounded-lg bg-card border p-3">
              <p className="text-xs text-muted-foreground">Montant restant</p>
              <p className="text-xl font-bold font-display text-destructive">{formatCurrency(stats.totalRemaining)}</p>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher un article ou client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Filters */}
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                filter === f.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:bg-secondary"
              )}
            >
              {f.label}
              {stats && f.value !== "all" && (
                <span className="ml-1 opacity-70">
                  {stats.byStatus[f.value as OrderStatus]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Order List */}
        <div className="space-y-3">
          {orders === undefined ? (
            <div className="py-12 text-center text-muted-foreground">Chargement...</div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <Package className="mb-3 h-12 w-12 text-muted-foreground/40" />
              <p className="text-muted-foreground">Aucune commande</p>
              <Button
                onClick={() => navigate("/order/new")}
                className="mt-4"
                variant="outline"
              >
                <Plus className="mr-2 h-4 w-4" />
                Créer une commande
              </Button>
            </div>
          ) : (
            orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
