import Dexie, { type Table } from "dexie";

export type OrderStatus = "nouveau" | "en_cours" | "livre" | "vendu";
export type Category = "enfant" | "femme" | "homme";

export interface OrderItem {
  id?: string; // UUID or temporary ID
  articleName: string;
  description: string;
  category: Category;
  size: string;
  color: string;
  fabricType: string;
  quantity: number;
  unitPrice: number; // NEW: prix unitaire
  amount?: number; // Calculated: unitPrice * quantity
}

export interface Order {
  id?: number;
  items: OrderItem[]; // NEW: array of items
  createdAt: string; // ISO date
  deadlineDate: string; // ISO date
  status: OrderStatus;
  totalAmount: number;
  receivedAmount: number;
  clientName: string;
}

export class ModaGestDB extends Dexie {
  orders!: Table<Order, number>;

  constructor() {
    super("modagest");
    this.version(1).stores({
      orders: "++id, status, category, articleName, deadlineDate, clientName",
    });

    // Migration from v1 to v2: convert single article orders to multi-item orders
    this.version(2).stores({
      orders: "++id, status, deadlineDate, clientName",
    }).upgrade(async (tx) => {
      // Get all old orders from v1
      const allOrders = await tx.table("orders").toArray();

      for (const oldOrder of allOrders) {
        // Convert old order format to new format
        if ("articleName" in oldOrder && !Array.isArray(oldOrder.items)) {
          const newOrder = {
            ...oldOrder,
            items: [
              {
                articleName: oldOrder.articleName,
                description: oldOrder.description,
                category: oldOrder.category,
                size: oldOrder.size,
                color: oldOrder.color,
                fabricType: oldOrder.fabricType,
                quantity: oldOrder.quantity,
                unitPrice: oldOrder.totalAmount / oldOrder.quantity || 0,
              } as OrderItem,
            ],
          };

          // Remove old fields from the order
          delete newOrder.articleName;
          delete newOrder.description;
          delete newOrder.category;
          delete newOrder.size;
          delete newOrder.color;
          delete newOrder.fabricType;
          delete newOrder.quantity;

          // Update the order with new format
          await tx.table("orders").put(newOrder);
        }
      }
    });
  }
}

export const db = new ModaGestDB();
