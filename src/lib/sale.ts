import { useEffect, useState } from "react";
import type { Product } from "./products";

/**
 * Limited-time 15% sale: 25 Oct 2026 00:00 IST → 6 Nov 2026 00:00 IST (exclusive end).
 * IST is UTC+5:30 year-round (no DST), so the boundaries are fixed UTC instants.
 * The sale is derived purely from the clock — no manual toggle, and once the end
 * instant passes every consumer sees the regular prices again.
 */
const SALE_START_UTC = Date.UTC(2026, 9, 24, 18, 30, 0); // 25 Oct 2026 00:00 IST
const SALE_END_UTC = Date.UTC(2026, 10, 5, 18, 30, 0); //  6 Nov 2026 00:00 IST
const DISCOUNT = 0.15;

export const SALE = {
  startUtc: SALE_START_UTC,
  endUtc: SALE_END_UTC,
  discount: DISCOUNT,
  label: "25 Oct – 5 Nov 2026",
};

export const isSaleActive = (now: number = Date.now()) =>
  now >= SALE_START_UTC && now < SALE_END_UTC;

export const msUntilSaleEnd = (now: number = Date.now()) =>
  Math.max(0, SALE_END_UTC - now);

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Discounted price during the sale; same as the regular price otherwise. */
export const salePrice = (p: Product) =>
  p.price === null ? null : round2(p.price * (1 - DISCOUNT));

/** The price a customer should actually be charged right now. */
export const effectivePrice = (p: Product, now: number = Date.now()) =>
  p.price === null ? null : isSaleActive(now) ? salePrice(p) : p.price;

/** Re-renders consumers when the sale starts or ends (checked every 30s). */
export function useSale() {
  const [active, setActive] = useState(() => isSaleActive());
  useEffect(() => {
    const t = setInterval(() => setActive(isSaleActive()), 30_000);
    return () => clearInterval(t);
  }, []);
  return active;
}
