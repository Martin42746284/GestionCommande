import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addOrder, updateOrder, useOrder } from "@/hooks/useOrders";
import { type Order, type OrderStatus, type Category, type OrderItem } from "@/lib/db";
import { CATEGORY_LABELS, STATUS_LABELS } from "@/lib/constants";
import { calculateItemAmount, calculateOrderTotal } from "@/lib/utils";
import { toast } from "sonner";

const generateId = () => Math.random().toString(36).substr(2, 9);

export default function OrderForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = id && id !== "new";
  const existingOrder = useOrder(isEdit ? Number(id) : undefined);

  const [items, setItems] = useState<OrderItem[]>([]);
  const [clientName, setClientName] = useState("");
  const [deadlineDate, setDeadlineDate] = useState("");
  const [status, setStatus] = useState<OrderStatus>("nouveau");
  const [receivedAmount, setReceivedAmount] = useState(0);

  useEffect(() => {
    if (existingOrder) {
      setItems(existingOrder.items || []);
      setClientName(existingOrder.clientName);
      setDeadlineDate(existingOrder.deadlineDate.split("T")[0]);
      setStatus(existingOrder.status);
      setReceivedAmount(existingOrder.receivedAmount);
    }
  }, [existingOrder]);

  const addItem = () => {
    const newItem: OrderItem = {
      id: generateId(),
      articleName: "",
      description: "",
      category: "femme",
      size: "",
      color: "",
      fabricType: "",
      quantity: 1,
      unitPrice: 0,
    };
    setItems([...items, newItem]);
  };

  const removeItem = (itemId: string | undefined) => {
    setItems(items.filter((item) => item.id !== itemId));
  };

  const updateItem = (itemId: string | undefined, updates: Partial<OrderItem>) => {
    setItems(
      items.map((item) =>
        item.id === itemId ? { ...item, ...updates } : item
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientName || !deadlineDate || items.length === 0) {
      toast.error("Veuillez remplir les champs obligatoires et ajouter au moins un article");
      return;
    }

    if (items.some((item) => !item.articleName || !item.unitPrice)) {
      toast.error("Tous les articles doivent avoir un nom et un prix unitaire");
      return;
    }

    const totalAmount = calculateOrderTotal(items);

    const orderData: Omit<Order, "id"> = {
      items,
      clientName,
      deadlineDate: new Date(deadlineDate).toISOString(),
      status,
      totalAmount,
      receivedAmount,
      createdAt: isEdit ? existingOrder!.createdAt : new Date().toISOString(),
    };

    try {
      if (isEdit) {
        await updateOrder(Number(id), orderData);
        toast.success("Commande mise à jour !");
      } else {
        await addOrder(orderData);
        toast.success("Commande créée !");
      }
      navigate(-1);
    } catch {
      toast.error("Erreur lors de l'enregistrement");
    }
  };

  const totalAmount = calculateOrderTotal(items);
  const remaining = totalAmount - receivedAmount;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-card/80 backdrop-blur-md">
        <div className="container flex items-center gap-3 py-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-display text-lg font-semibold text-foreground">
            {isEdit ? "Modifier la commande" : "Nouvelle commande"}
          </h1>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="container space-y-4 py-4 pb-24">
        {/* Client */}
        <div className="space-y-2">
          <Label htmlFor="clientName">Nom du client *</Label>
          <Input
            id="clientName"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Ex: Mme Diallo"
          />
        </div>

        {/* Deadline */}
        <div className="space-y-2">
          <Label htmlFor="deadlineDate">Date de besoin *</Label>
          <Input
            id="deadlineDate"
            type="date"
            value={deadlineDate}
            onChange={(e) => setDeadlineDate(e.target.value)}
          />
        </div>

        {isEdit && (
          <div className="space-y-2">
            <Label>Statut</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as OrderStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(STATUS_LABELS) as OrderStatus[]).map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Articles List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-semibold text-foreground">Articles</h2>
            <Button type="button" variant="outline" size="sm" onClick={addItem}>
              <Plus className="mr-1 h-4 w-4" />
              Ajouter un article
            </Button>
          </div>

          {items.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-muted p-8 text-center">
              <p className="text-sm text-muted-foreground">
                Aucun article ajouté. Cliquez sur "Ajouter un article" pour commencer.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg border bg-card p-4 space-y-3"
                >
                  {/* Article Header with Delete */}
                  <div className="flex items-start justify-between">
                    <h3 className="font-display font-semibold text-foreground">
                      {item.articleName || "Nouvel article"}
                    </h3>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Article Name */}
                  <div className="space-y-2">
                    <Label>Nom de l'article *</Label>
                    <Input
                      value={item.articleName}
                      onChange={(e) =>
                        updateItem(item.id, { articleName: e.target.value })
                      }
                      placeholder="Ex: Robe de soirée"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={item.description}
                      onChange={(e) =>
                        updateItem(item.id, { description: e.target.value })
                      }
                      placeholder="Détails supplémentaires..."
                      rows={2}
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <Label>Catégorie</Label>
                    <Select
                      value={item.category}
                      onValueChange={(v) =>
                        updateItem(item.id, { category: v as Category })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(CATEGORY_LABELS) as Category[]).map((c) => (
                          <SelectItem key={c} value={c}>
                            {CATEGORY_LABELS[c]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Size, Color, Fabric */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-2">
                      <Label>Taille</Label>
                      <Input
                        value={item.size}
                        onChange={(e) =>
                          updateItem(item.id, { size: e.target.value })
                        }
                        placeholder="Ex: M"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Couleur</Label>
                      <Input
                        value={item.color}
                        onChange={(e) =>
                          updateItem(item.id, { color: e.target.value })
                        }
                        placeholder="Ex: Rouge"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Tissu</Label>
                      <Input
                        value={item.fabricType}
                        onChange={(e) =>
                          updateItem(item.id, { fabricType: e.target.value })
                        }
                        placeholder="Ex: Bazin"
                      />
                    </div>
                  </div>

                  {/* Quantity & Unit Price */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Quantité</Label>
                      <Input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(item.id, {
                            quantity: Math.max(1, Number(e.target.value)),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Prix unitaire (Ar) *</Label>
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        value={item.unitPrice}
                        onChange={(e) =>
                          updateItem(item.id, {
                            unitPrice: Math.max(0, Number(e.target.value)),
                          })
                        }
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {/* Item Total (Read-only) */}
                  <div className="rounded bg-muted p-2 flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">
                      Montant:
                    </span>
                    <span className="font-display font-semibold text-foreground">
                      {calculateItemAmount(item).toLocaleString("fr-FR")} Ar
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary & Payment */}
        <div className="rounded-lg border bg-card p-4 space-y-3">
          <h3 className="font-display font-semibold text-foreground">Résumé</h3>
          <div className="space-y-2 border-b pb-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Articles :</span>
              <span className="font-medium">{items.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Montant total :</span>
              <span className="font-display font-semibold text-foreground">
                {totalAmount.toLocaleString("fr-FR")} Ar
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="receivedAmount">Montant reçu</Label>
            <Input
              id="receivedAmount"
              type="number"
              min={0}
              value={receivedAmount}
              onChange={(e) => setReceivedAmount(Math.max(0, Number(e.target.value)))}
            />
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Montant restant :</span>
            <span
              className={
                remaining > 0
                  ? "font-semibold text-destructive"
                  : "font-semibold text-status-delivered"
              }
            >
              {remaining.toLocaleString("fr-FR")} Ar
            </span>
          </div>
        </div>

        {/* Submit */}
        <Button type="submit" className="w-full" size="lg">
          <Save className="mr-2 h-4 w-4" />
          {isEdit ? "Mettre à jour" : "Enregistrer la commande"}
        </Button>
      </form>
    </div>
  );
}
