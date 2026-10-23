import { createFileRoute } from "@tanstack/react-router";
import { RANKS } from "@/lib/products";
import { ProductGrid, SectionTitle } from "@/components/site";

export const Route = createFileRoute("/ranks")({
  head: () => ({
    meta: [
      { title: "Ranks — GAMERSTEAL Store" },
      { name: "description", content: "Buy DESTROYER, TITAN, DEADLIEST and GAMER ranks for GAMERSTEAL Survival SMP. From ₹100." },
      { property: "og:title", content: "Ranks — GAMERSTEAL Store" },
      { property: "og:description", content: "DESTROYER, TITAN, DEADLIEST and the ultimate GAMER rank for GAMERSTEAL Survival SMP." },
    ],
  }),
  component: () => (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <SectionTitle eyebrow="Rank Store" title="RANKS" sub="Choose your power. One rank per player." />
      <ProductGrid products={RANKS} />
    </section>
  ),
});
