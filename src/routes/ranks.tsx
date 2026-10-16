import { createFileRoute } from "@tanstack/react-router";
import { RANKS } from "@/lib/products";
import { ProductGrid, SectionTitle } from "@/components/site";

export const Route = createFileRoute("/ranks")({
  head: () => ({
    meta: [
      { title: "Ranks — GAMERSTEAL Store" },
      { name: "description", content: "Buy ETERNAL, ELITE, DIVINE and GAMER ranks for GAMERSTEAL LifeSteal SMP." },
      { property: "og:title", content: "Ranks — GAMERSTEAL Store" },
      { property: "og:description", content: "ETERNAL, ELITE, DIVINE and the ultimate GAMER rank." },
    ],
  }),
  component: () => (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <SectionTitle eyebrow="Rank Store" title="RANKS" sub="Choose your power. One rank per player." />
      <ProductGrid products={RANKS} />
    </section>
  ),
});
