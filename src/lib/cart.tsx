import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { ALL_PRODUCTS, type Product } from "./products";
import { effectivePrice } from "./sale";

type Line = { id: string; qty: number };
type Ctx = {
  lines: (Line & { product: Product })[];
  add: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  count: number;
  total: number;
  hasUnpriced: boolean;
};
const CartCtx = createContext<Ctx | null>(null);
const KEY = "gamersteal-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [raw, setRaw] = useState<Line[]>([]);
  useEffect(() => {
    try { setRaw(JSON.parse(localStorage.getItem(KEY) || "[]")); } catch { /* ignore */ }
  }, []);
  const save = (next: Line[]) => { setRaw(next); localStorage.setItem(KEY, JSON.stringify(next)); };

  const lines = raw
    .map((l) => ({ ...l, product: ALL_PRODUCTS.find((p) => p.id === l.id)! }))
    .filter((l) => l.product);

  const value: Ctx = {
    lines,
    add: (id) => {
      const ex = raw.find((l) => l.id === id);
      const product = ALL_PRODUCTS.find((p) => p.id === id);
      // Ranks are one per player
      if (ex && product?.kind === "rank") return;
      save(ex ? raw.map((l) => (l.id === id ? { ...l, qty: l.qty + 1 } : l)) : [...raw, { id, qty: 1 }]);
    },
    setQty: (id, qty) => save(qty <= 0 ? raw.filter((l) => l.id !== id) : raw.map((l) => (l.id === id ? { ...l, qty } : l))),
    remove: (id) => save(raw.filter((l) => l.id !== id)),
    clear: () => save([]),
    count: lines.reduce((s, l) => s + l.qty, 0),
    total: lines.reduce((s, l) => s + (effectivePrice(l.product) ?? 0) * l.qty, 0),
    hasUnpriced: lines.some((l) => l.product.price === null),
  };
  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export const useCart = () => {
  const c = useContext(CartCtx);
  if (!c) throw new Error("useCart outside CartProvider");
  return c;
};
