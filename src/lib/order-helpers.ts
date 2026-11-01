import { ALL_PRODUCTS } from "./products";

/** "." prefix allowed for Bedrock players */
export function validateMcUsername(name: string): string | null {
  if (!/^\.?[A-Za-z0-9_]{3,16}$/.test(name.trim()))
    return "Enter a valid Minecraft username (3–16 letters, numbers or _, or .Name for Bedrock).";
  return null;
}

export function validateEmail(email: string): string | null {
  if (!/^\S+@\S+\.\S+$/.test(email.trim())) return "Enter a valid email address.";
  return null;
}

export type CartItemInput = { id: string; qty: number };
export type BuiltItem = { id: string; name: string; qty: number; price: number };

/** Recomputes the order server-side from the catalog — never trusts client totals. */
export function buildOrderItems(items: CartItemInput[]): { error: string } | { items: BuiltItem[]; total: number } {
  if (!Array.isArray(items) || items.length === 0) return { error: "Your cart is empty." };
  const built: BuiltItem[] = [];
  for (const it of items) {
    const p = ALL_PRODUCTS.find((x) => x.id === it.id);
    if (!p) return { error: `Unknown product: ${it.id}` };
    if (p.price === null) return { error: `${p.name} is not purchasable yet.` };
    const qty = Math.floor(Number(it.qty));
    if (!Number.isFinite(qty) || qty < 1 || qty > 99) return { error: `Invalid quantity for ${p.name}.` };
    if (p.kind === "rank" && qty > 1) return { error: `Only one ${p.name} rank per player.` };
    built.push({ id: p.id, name: p.name, qty, price: p.price });
  }
  const total = built.reduce((s, i) => s + i.price * i.qty, 0);
  return { items: built, total };
}

/** Order codes look like GS-AB12CD (no confusing 0/O/1/I). */
export function validateOrderCode(code: string): boolean {
  return /^GS-[A-HJ-NP-Z2-9]{6}$/.test(code);
}

export function genOrderCode(): string {
  const cs = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return `GS-${Array.from(bytes, (b) => cs[b % cs.length]).join("")}`;
}

/** Proof uploads may only land under proofs/<order code>/ (single file). */
export function isValidProofPath(code: string, path: string): boolean {
  const prefix = `proofs/${code}/`;
  if (!path.startsWith(prefix)) return false;
  const rest = path.slice(prefix.length);
  return rest.length > 0 && !rest.includes("/") && !rest.includes("..");
}

export const ORDER_STATUSES = ["pending", "verified", "rejected", "delivered"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export function isValidOrderStatus(s: string): s is OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(s);
}
