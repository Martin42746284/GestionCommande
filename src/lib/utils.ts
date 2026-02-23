import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { OrderItem } from "./db";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Calculate amount for a single order item (unitPrice * quantity)
export function calculateItemAmount(item: OrderItem): number {
  return item.unitPrice * item.quantity;
}

// Calculate total amount for all order items
export function calculateOrderTotal(items: OrderItem[]): number {
  return items.reduce((total, item) => total + calculateItemAmount(item), 0);
}
