import { createFileRoute } from "@tanstack/react-router";
import { KEYS } from "@/lib/products";
import { ProductGrid, SectionTitle } from "@/components/site";

export const Route = createFileRoute("/keys")({
  head: () => ({
    meta: [
      { title: "Crate Keys — GAMERSTEAL Store" },
      { name: "description", content: "Common, Rare, Epic and Legendary crate keys for GAMERSTEAL LifeSteal SMP." },
      { property: "og:title", content: "Crate Keys — GAMERSTEAL Store" },
      { property: "og:description", content: "Crate keys for GAMERSTEAL. Prices and rewards coming soon." },
    ],
  }),
  component: () => (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <SectionTitle eyebrow="Loot awaits" title="CRATE KEYS" sub="Prices and rewards will be announced soon." />
      <ProductGrid products={KEYS} />
    </section>
  ),
});
