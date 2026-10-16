import { createFileRoute } from "@tanstack/react-router";
import { KEYS } from "@/lib/products";
import { ProductGrid, SectionTitle } from "@/components/site";

export const Route = createFileRoute("/keys")({
  head: () => ({
    meta: [
      { title: "Crate Keys — GAMERSTEAL Store" },
      { name: "description", content: "Secret, Eternal, Cosmic, Enchanted and Gamer crate keys for GAMERSTEAL LifeSteal SMP. From ₹30." },
      { property: "og:title", content: "Crate Keys — GAMERSTEAL Store" },
      { property: "og:description", content: "Secret, Eternal, Cosmic, Enchanted and Gamer crate keys for GAMERSTEAL." },
    ],
  }),
  component: () => (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <SectionTitle eyebrow="Loot awaits" title="CRATE KEYS" sub="Five tiers of loot — from Secret to Gamer." />
      <ProductGrid products={KEYS} />
    </section>
  ),
});
