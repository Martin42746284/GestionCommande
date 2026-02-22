import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
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
import { type Order, type OrderStatus, type Category } from "@/lib/db";
import { CATEGORY_LABELS, STATUS_LABELS } from "@/lib/constants";
import { toast } from "sonner";

export default function OrderForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = id && id !== "new";
  const existingOrder = useOrder(isEdit ? Number(id) : undefined);

  const [form, setForm] = useState({
    articleName: "",
    description: "",
    category: "femme" as Category,
    size: "",
    color: "",
    fabricType: "",
    quantity: 1,
    deadlineDate: "",
    status: "nouveau" as OrderStatus,
    totalAmount: 0,
    receivedAmount: 0,
    clientName: "",
  });

  useEffect(() => {
    if (existingOrder) {
      setForm({
        articleName: existingOrder.articleName,
        description: existingOrder.description,
        category: existingOrder.category,
        size: existingOrder.size,
        color: existingOrder.color,
        fabricType: existingOrder.fabricType,
        quantity: existingOrder.quantity,
        deadlineDate: existingOrder.deadlineDate.split("T")[0],
        status: existingOrder.status,
        totalAmount: existingOrder.totalAmount,
        receivedAmount: existingOrder.receivedAmount,
        clientName: existingOrder.clientName,
      });
    }
  }, [existingOrder]);

  const set = (key: string, value: any) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.articleName || !form.clientName || !form.deadlineDate) {
      toast.error("Veuillez remplir les champs obligatoires");
      return;
    }

    const orderData: Omit<Order, "id"> = {
      ...form,
      createdAt: isEdit ? existingOrder!.createdAt : new Date().toISOString(),
      deadlineDate: new Date(form.deadlineDate).toISOString(),
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

  const remaining = form.totalAmount - form.receivedAmount;

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
          <Input id="clientName" value={form.clientName} onChange={(e) => set("clientName", e.target.value)} placeholder="Ex: Mme Diallo" />
        </div>

        {/* Article */}
        <div className="space-y-2">
          <Label htmlFor="articleName">Nom de l'article *</Label>
          <Input id="articleName" value={form.articleName} onChange={(e) => set("articleName", e.target.value)} placeholder="Ex: Robe de soirée" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Détails supplémentaires..." rows={2} />
        </div>

        {/* Category & Status */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Catégorie</Label>
            <Select value={form.category} onValueChange={(v) => set("category", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(CATEGORY_LABELS) as Category[]).map((c) => (
                  <SelectItem key={c} value={c}>{CATEGORY_LABELS[c]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {isEdit && (
            <div className="space-y-2">
              <Label>Statut</Label>
              <Select value={form.status} onValueChange={(v) => set("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(STATUS_LABELS) as OrderStatus[]).map((s) => (
                    <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="size">Taille</Label>
            <Input id="size" value={form.size} onChange={(e) => set("size", e.target.value)} placeholder="Ex: M (1m50)" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="color">Couleur</Label>
            <Input id="color" value={form.color} onChange={(e) => set("color", e.target.value)} placeholder="Ex: Rouge" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="fabricType">Type de tissu</Label>
            <Input id="fabricType" value={form.fabricType} onChange={(e) => set("fabricType", e.target.value)} placeholder="Ex: Bazin" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantité</Label>
            <Input id="quantity" type="number" min={1} value={form.quantity} onChange={(e) => set("quantity", Number(e.target.value))} />
          </div>
        </div>

        {/* Deadline */}
        <div className="space-y-2">
          <Label htmlFor="deadlineDate">Date de besoin *</Label>
          <Input id="deadlineDate" type="date" value={form.deadlineDate} onChange={(e) => set("deadlineDate", e.target.value)} />
        </div>

        {/* Amounts */}
        <div className="rounded-lg border bg-card p-4 space-y-3">
          <h3 className="font-display font-semibold text-foreground">Paiement</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="totalAmount">Montant total</Label>
              <Input id="totalAmount" type="number" min={0} value={form.totalAmount} onChange={(e) => set("totalAmount", Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="receivedAmount">Montant reçu</Label>
              <Input id="receivedAmount" type="number" min={0} value={form.receivedAmount} onChange={(e) => set("receivedAmount", Number(e.target.value))} />
            </div>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Montant restant :</span>
            <span className={remaining > 0 ? "font-semibold text-destructive" : "font-semibold text-status-delivered"}>
              {remaining.toLocaleString("fr-FR")} FCFA
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
