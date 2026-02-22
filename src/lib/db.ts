import Dexie, { type Table } from "dexie";

export type OrderStatus = "nouveau" | "en_cours" | "livre" | "vendu";
export type Category = "enfant" | "femme" | "homme";

export interface Order {
  id?: number;
  articleName: string;
  description: string;
  category: Category;
  size: string;
  color: string;
  fabricType: string;
  quantity: number;
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
  }
}

export const db = new ModaGestDB();
