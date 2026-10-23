import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/lib/cart";
import { formatINR } from "@/lib/products";
import { btn, SectionTitle } from "@/components/site";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — GAMERSTEAL Store" },
      { name: "description", content: "Review the ranks in your GAMERSTEAL cart." },
      { property: "og:title", content: "Your Cart — GAMERSTEAL Store" },
      { property: "og:description", content: "Review your GAMERSTEAL cart." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { lines, setQty, remove, total } = useCart();
  return (
    <section className="mx-auto max-w-4xl px-4 py-16">
      <SectionTitle eyebrow="Checkout" title="YOUR CART" />
      {lines.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center">
          <p className="text-muted-foreground">Your cart is empty.</p>
          <Link to="/ranks" className={`${btn.primary} mt-6`}>Browse ranks</Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-[1fr_300px]">
          <ul className="space-y-3">
            {lines.map(({ id, qty, product: p }) => (
              <li key={id} className="glass flex items-center gap-4 rounded-2xl p-3">
                <img src={p.image} alt="" className="h-16 w-16 rounded-lg object-cover" />
                <div className="flex-1">
                  <p className="font-display">{p.name}</p>
                  <p className="text-sm text-muted-foreground">{formatINR(p.price)}</p>
                </div>
                {p.kind === "key" ? (
                  <div className="flex items-center gap-2">
                    <button className="glass rounded p-1.5" onClick={() => setQty(id, qty - 1)} aria-label="Decrease"><Minus className="h-3 w-3" /></button>
                    <span className="w-6 text-center">{qty}</span>
                    <button className="glass rounded p-1.5" onClick={() => setQty(id, qty + 1)} aria-label="Increase"><Plus className="h-3 w-3" /></button>
                  </div>
                ) : <span className="text-xs text-muted-foreground">×1</span>}
                <button onClick={() => remove(id)} className="p-2 text-muted-foreground hover:text-destructive" aria-label="Remove"><Trash2 className="h-4 w-4" /></button>
              </li>
            ))}
          </ul>
          <aside className="glass h-fit rounded-2xl p-6">
            <div className="flex justify-between font-display text-xl"><span>Total</span><span>{formatINR(total)}</span></div>
            <Link to="/checkout" className={`${btn.primary} mt-6 w-full`}>Checkout</Link>
          </aside>
        </div>
      )}
    </section>
  );
}
