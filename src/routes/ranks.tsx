import { createFileRoute } from "@tanstack/react-router";
import { RANKS } from "@/lib/products";
import { ProductGrid, SectionTitle } from "@/components/site";

export const Route = createFileRoute("/ranks")({
  head: () => ({
    meta: [
      { title: "Ranks — GAMERSTEAL Store" },
      { name: "description", content: "Explore Minecraft ranks and custom rank options for GAMERSTEAL SMP. Compare DESTROYER, TITAN, DEADLIEST and GAMER ranks for the Survival server." },
      { property: "og:title", content: "Ranks — GAMERSTEAL Store" },
      { property: "og:description", content: "Compare DESTROYER, TITAN, DEADLIEST and GAMER rank options for the official GAMERSTEAL SMP." },
      { property: "og:url", content: "https://shop.tgadev.online/ranks" },
    ],
    links: [{ rel: "canonical", href: "https://shop.tgadev.online/ranks" }],
  }),
  staticData: { sitemap: true },
  component: () => (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <SectionTitle eyebrow="Rank Store" title="RANKS" sub="Choose your power. One rank per player." />
      <ProductGrid products={RANKS} />
    </section>
  ),
});
