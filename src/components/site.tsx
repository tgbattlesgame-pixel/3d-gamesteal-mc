import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Menu, ShoppingCart, X, Copy, Check } from "lucide-react";
import logo from "@/assets/gamersteal-logo.png";
import { SERVER, formatINR, type Product } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { useSale, effectivePrice } from "@/lib/sale";

const btnBase = "inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:pointer-events-none";
export const btn = {
  primary: `${btnBase} bg-brand text-primary-foreground shadow-glow hover:scale-[1.03] hover:shadow-glow-red`,
  ghost: `${btnBase} glass text-foreground hover:border-primary hover:shadow-glow`,
};

export function DiscordIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M20.3 4.4A19.8 19.8 0 0 0 15.4 3l-.6 1.3a18.4 18.4 0 0 0-5.6 0L8.6 3a19.7 19.7 0 0 0-4.9 1.5C.6 9.1-.3 13.6.1 18.1a19.9 19.9 0 0 0 6 3l1.3-2a12.9 12.9 0 0 1-2-1l.5-.4a14.2 14.2 0 0 0 12.2 0l.5.4-2 1 1.3 2a19.8 19.8 0 0 0 6-3c.5-5.2-.8-9.7-3.6-13.7ZM8 15.3c-1.2 0-2.2-1.1-2.2-2.4S6.8 10.5 8 10.5s2.2 1.1 2.2 2.4-1 2.4-2.2 2.4Zm8 0c-1.2 0-2.2-1.1-2.2-2.4s1-2.4 2.2-2.4 2.2 1.1 2.2 2.4-1 2.4-2.2 2.4Z" />
    </svg>
  );
}

export function DiscordButton({ label = "Join Discord", className = btn.ghost }: { label?: string; className?: string }) {
  return (
    <a href={SERVER.discord} target="_blank" rel="noopener noreferrer" className={className}>
      <DiscordIcon /> {label}
    </a>
  );
}

export function CopyIP({ big = false }: { big?: boolean }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={async () => {
        try { await navigator.clipboard.writeText(SERVER.ip); setOk(true); toast.success("Server IP copied!"); setTimeout(() => setOk(false), 1800); }
        catch { toast.error("Couldn't copy — please copy it manually."); }
      }}
      className={`glass group inline-flex items-center gap-3 rounded-xl ${big ? "px-5 py-3" : "px-3 py-2"} font-display tracking-wider hover:shadow-glow transition`}
      aria-label="Copy server IP"
    >
      <span className="h-2 w-2 rounded-full bg-primary pulse-glow" />
      <span className={big ? "text-base sm:text-lg" : "text-xs"}>{SERVER.ip}</span>
      {ok ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />}
    </button>
  );
}

const NAV = [
  { to: "/", label: "Home" },
  { to: "/ranks", label: "Ranks" },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { count } = useCart();
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="flex items-center" aria-label="GAMERSTEAL home">
          <img src={logo} alt="GAMERSTEAL MC" className="h-10 w-auto" />
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} activeOptions={{ exact: true }} className="text-sm font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground" activeProps={{ className: "text-foreground" }}>
              {n.label}
            </Link>
          ))}
          <a href={SERVER.discord} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground">Discord</a>
        </nav>
        <div className="flex items-center gap-2">
          <DiscordButton label="Join" className={`${btn.ghost} hidden !px-3 !py-2 sm:inline-flex`} />
          <Link to="/cart" className="glass relative rounded-lg p-2.5 hover:shadow-glow" aria-label={`Cart, ${count} items`}>
            <ShoppingCart className="h-5 w-5" />
            {count > 0 && <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-blood px-1 text-[10px] font-bold">{count}</span>}
          </Link>
          <button className="glass rounded-lg p-2.5 md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="border-t border-border px-4 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 font-semibold uppercase tracking-wider hover:bg-secondary">{n.label}</Link>
            ))}
            <DiscordButton label="Join our Discord" className={`${btn.primary} mt-2`} />
          </div>
        </nav>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-3">
        <div>
          <img src={logo} alt="GAMERSTEAL MC" className="h-16 w-auto" loading="lazy" />
          <p className="mt-3 text-sm text-muted-foreground">{SERVER.mode} • {SERVER.season}</p>
          <p className="mt-1 text-sm text-muted-foreground">Owner / Dev: <span className="font-semibold text-foreground">{SERVER.owner}</span></p>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <Link to="/" className="text-muted-foreground hover:text-foreground">Home</Link>
          <Link to="/ranks" className="text-muted-foreground hover:text-foreground">Ranks</Link>
          <a href={SERVER.discord} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">Discord</a>
        </div>
        <div className="flex flex-col items-start gap-3">
          <CopyIP />
          <DiscordButton label="Join our Discord" />
        </div>
      </div>
      <p className="border-t border-border py-6 text-center text-xs text-muted-foreground">Powered by <span className="font-bold text-foreground">{SERVER.poweredBy}</span> • Owner/Dev {SERVER.owner} • © 2026 GAMERSTEAL. All rights reserved. Not affiliated with Mojang or Microsoft.</p>
    </footer>
  );
}

export function SectionTitle({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div className="mx-auto mb-10 max-w-2xl text-center">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">{eyebrow}</p>
      <h2 className="mt-2 text-3xl sm:text-5xl"><span className="text-brand">{title}</span></h2>
      {sub && <p className="mt-3 text-muted-foreground">{sub}</p>}
    </div>
  );
}

export function ProductCard({ p, onDetails }: { p: Product; onDetails: (p: Product) => void }) {
  const { add } = useCart();
  const sale = useSale();
  return (
    <article className={`glass group relative flex flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1.5 ${p.featured ? "border-blood/60 shadow-glow-red" : "hover:shadow-glow"}`}>
      {sale && p.price !== null && <span className="absolute left-3 top-3 z-10 rounded-full bg-blood px-3 py-1 text-[10px] font-bold uppercase tracking-widest">15% off</span>}
      {p.featured && <span className="absolute right-3 top-3 z-10 rounded-full bg-brand px-3 py-1 text-[10px] font-bold uppercase tracking-widest">{p.kind === "rank" ? "Ultimate" : "Best"}</span>}
      <div className="relative aspect-square overflow-hidden bg-background">
        <img src={p.image} alt={`${p.name} artwork`} loading="lazy" width={512} height={512} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 float-slow" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background to-transparent" />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className={`text-2xl ${p.featured ? "text-brand" : ""}`}>{p.name}</h3>
          <p className="text-sm text-muted-foreground">{p.tagline}</p>
        </div>
        <PriceTag p={p} />
        <div className="mt-auto grid grid-cols-2 gap-2">
          <button onClick={() => onDetails(p)} className={`${btn.ghost} !px-2 !py-2.5 !text-xs`}>View details</button>
          <button
            disabled={p.price === null}
            onClick={() => { add(p.id); toast.success(`${p.name} added to cart`); }}
            className={`${btn.primary} !px-2 !py-2.5 !text-xs`}
          >
            {p.price === null ? "Soon" : "Buy now"}
          </button>
        </div>
      </div>
    </article>
  );
}

export function ProductModal({ p, onClose }: { p: Product | null; onClose: () => void }) {
  const { add } = useCart();
  if (!p) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-4 backdrop-blur-sm animate-in fade-in" onClick={onClose} role="dialog" aria-modal aria-label={p.name}>
      <div className="glass relative grid w-full max-w-3xl overflow-hidden rounded-2xl shadow-glow md:grid-cols-2 animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute right-3 top-3 z-10 rounded-lg bg-background/70 p-2" aria-label="Close"><X className="h-4 w-4" /></button>
        <img src={p.image} alt={`${p.name} artwork`} className="aspect-square w-full object-cover" />
        <div className="flex flex-col gap-4 p-6">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">Rank</p>
          <h3 className="text-4xl text-brand">{p.name}</h3>
          <p className="text-muted-foreground">{p.tagline}</p>
          <ul className="space-y-2 text-sm">
            {p.perks.map((x) => <li key={x} className="flex gap-2"><span className="text-primary">◆</span>{x}</li>)}
          </ul>
          <PriceTag p={p} size="lg" />
          <button
            disabled={p.price === null}
            onClick={() => { add(p.id); toast.success(`${p.name} added to cart`); onClose(); }}
            className={`${btn.primary} mt-auto`}
          >
            <ShoppingCart className="h-4 w-4" /> {p.price === null ? "Coming soon" : "Add to cart"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  const [sel, setSel] = useState<Product | null>(null);
  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => <ProductCard key={p.id} p={p} onDetails={setSel} />)}
      </div>
      <ProductModal p={sel} onClose={() => setSel(null)} />
    </>
  );
}

/** Price display that shows the regular price, or the strikethrough + sale price during the sale. */
export function PriceTag({ p, size = "md", className = "" }: { p: Product; size?: "sm" | "md" | "lg"; className?: string }) {
  const sale = useSale();
  const sizes = { sm: "text-sm", md: "text-2xl", lg: "text-3xl" } as const;
  const strikes = { sm: "text-xs", md: "text-sm", lg: "text-lg" } as const;
  if (p.price === null)
    return <p className={`font-display ${sizes[size]} text-foreground ${className}`}>{formatINR(null)}</p>;
  if (!sale)
    return <p className={`font-display ${sizes[size]} text-foreground ${className}`}>{formatINR(p.price)}</p>;
  return (
    <p className={`font-display ${sizes[size]} ${className}`}>
      <span className={`${strikes[size]} mr-2 text-muted-foreground line-through`} aria-label="Original price">{formatINR(p.price)}</span>
      <span className="text-brand">{formatINR(effectivePrice(p))}</span>
      <span className="sr-only"> (sale price)</span>
    </p>
  );
}
