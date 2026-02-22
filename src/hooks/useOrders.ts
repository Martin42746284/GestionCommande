import { useLiveQuery } from "dexie-react-hooks";
import { db, type Order, type OrderStatus } from "@/lib/db";

export function useOrders(statusFilter?: OrderStatus, search?: string) {
  return useLiveQuery(async () => {
    let collection = db.orders.orderBy("deadlineDate");
    let results = await collection.toArray();

    if (statusFilter) {
      results = results.filter((o) => o.status === statusFilter);
    }
    if (search && search.trim()) {
      const q = search.toLowerCase();
      results = results.filter(
        (o) =>
          o.articleName.toLowerCase().includes(q) ||
          o.clientName.toLowerCase().includes(q)
      );
    }
    return results;
  }, [statusFilter, search]);
}

export function useOrder(id: number | undefined) {
  return useLiveQuery(() => (id ? db.orders.get(id) : undefined), [id]);
}

export async function addOrder(order: Omit<Order, "id">) {
  return db.orders.add(order);
}

export async function updateOrder(id: number, changes: Partial<Order>) {
  return db.orders.update(id, changes);
}

export async function deleteOrder(id: number) {
  return db.orders.delete(id);
}

export function useStats() {
  return useLiveQuery(async () => {
    const all = await db.orders.toArray();
    const totalOrders = all.length;
    const totalSales = all.reduce((s, o) => s + o.totalAmount, 0);
    const totalReceived = all.reduce((s, o) => s + o.receivedAmount, 0);
    const totalRemaining = totalSales - totalReceived;
    const byStatus = {
      nouveau: all.filter((o) => o.status === "nouveau").length,
      en_cours: all.filter((o) => o.status === "en_cours").length,
      livre: all.filter((o) => o.status === "livre").length,
      vendu: all.filter((o) => o.status === "vendu").length,
    };
    return { totalOrders, totalSales, totalReceived, totalRemaining, byStatus };
  });
}
