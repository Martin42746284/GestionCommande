import { type OrderStatus, type Category } from "@/lib/db";

export const STATUS_LABELS: Record<OrderStatus, string> = {
  nouveau: "Nouveau",
  en_cours: "En cours",
  livre: "Livré",
  vendu: "Vendu",
};

export const STATUS_COLORS: Record<OrderStatus, string> = {
  nouveau: "bg-status-new",
  en_cours: "bg-status-in-progress",
  livre: "bg-status-delivered",
  vendu: "bg-status-sold",
};

export const CATEGORY_LABELS: Record<Category, string> = {
  enfant: "Enfant",
  femme: "Femme",
  homme: "Homme",
};

export const CATEGORY_EMOJI: Record<Category, string> = {
  enfant: "👶",
  femme: "👗",
  homme: "👔",
};

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function daysUntil(iso: string) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(iso);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}
