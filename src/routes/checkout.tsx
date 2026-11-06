import { createFileRoute, Link } from "@tanstack/react-router";
import { useCart } from "@/lib/cart";
import { formatINR } from "@/lib/products";
import { btn, DiscordButton, SectionTitle } from "@/components/site";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Discord Ticket — GAMERSTEAL Store" },
      { name: "description", content: "Continue your GAMERSTEAL Store purchase by creating a ticket on Discord." },
      { property: "og:title", content: "Discord Ticket — GAMERSTEAL Store" },
      { property: "og:description", content: "Continue your GAMERSTEAL Store purchase by creating a ticket on Discord." },
      { property: "og:url", content: "https://shop.tgadev.online/checkout" },
      { name: "robots", content: "noindex, follow" },
    ],
    links: [{ rel: "canonical", href: "https://shop.tgadev.online/checkout" }],
  }),
  staticData: { sitemap: false },
  component: Checkout,
});

function Checkout() {
  const { lines, total } = useCart();

  if (lines.length === 0)
    return (
      <section className="mx-auto max-w-xl px-4 py-16 text-center">
        <SectionTitle eyebrow="Discord ticket" title="NO ITEMS SELECTED" />
        <Link to="/ranks" className={btn.primary}>Browse the store</Link>
      </section>
    );

  return (
    <section className="mx-auto max-w-4xl px-4 py-16">
      <SectionTitle eyebrow="Purchase through Discord" title="CREATE A TICKET" sub="Review your selected items, then open a ticket so our team can help you." />
      <div className="grid gap-6 md:grid-cols-[1fr_300px]">
        <div className="glass space-y-4 rounded-2xl p-6">
          <h2 className="font-display text-xl">Your selected items</h2>
          <p className="text-sm text-muted-foreground">In your Discord ticket, share your Minecraft username and the items you want. The team will help you with the next steps.</p>
          <DiscordButton label="Open a ticket on Discord" className={`${btn.primary} w-full`} />
        </div>
        <aside className="glass h-fit space-y-3 rounded-2xl p-6">
          {lines.map(({ id, qty, product: p }) => (
            <div key={id} className="flex justify-between text-sm"><span>{p.name} ×{qty}</span><span>{formatINR((p.price ?? 0) * qty)}</span></div>
          ))}
          <div className="flex justify-between border-t border-border pt-3 font-display text-lg"><span>Total</span><span>{formatINR(total)}</span></div>
        </aside>
      </div>
    </section>
  );
}
