import { useEffect, useState } from "react";
import { SALE, isSaleActive, msUntilSaleEnd } from "@/lib/sale";

function split(ms: number) {
  const s = Math.floor(ms / 1000);
  return {
    d: Math.floor(s / 86400),
    h: Math.floor((s % 86400) / 3600),
    m: Math.floor((s % 3600) / 60),
    sec: s % 60,
  };
}

export function SaleBanner() {
  const [state, setState] = useState(() => ({ active: isSaleActive(), remaining: msUntilSaleEnd() }));
  useEffect(() => {
    const tick = () => setState({ active: isSaleActive(), remaining: msUntilSaleEnd() });
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);
  if (!state.active) return null;
  const { d, h, m, sec } = split(state.remaining);
  const cell = (v: number, l: string) => (
    <span key={l} className="flex min-w-[2.6rem] flex-col items-center rounded-lg bg-background/50 px-1.5 py-1">
      <span className="font-display text-base leading-none">{String(v).padStart(2, "0")}</span>
      <span className="text-[9px] uppercase tracking-widest opacity-80">{l}</span>
    </span>
  );
  return (
    <div className="relative overflow-hidden border-b border-blood/40 bg-gradient-to-r from-blood/25 via-gold/20 to-blood/25" role="status">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-2 px-4 py-2.5 text-center sm:flex-row sm:gap-4">
        <p className="text-sm font-bold uppercase tracking-wider">🔥 Special sale — 15% off all ranks!</p>
        <p className="text-xs text-muted-foreground">📅 Valid 25 Oct – 5 Nov 2026</p>
        <div className="flex items-center gap-1" aria-label="Time left in the sale">
          {cell(d, "days")}
          {cell(h, "hrs")}
          {cell(m, "min")}
          {cell(sec, "sec")}
        </div>
      </div>
    </div>
  );
}

// Keep the import referenced so tree-shaking never drops the sale window metadata.
void SALE;
