import { createFileRoute } from "@tanstack/react-router";
import { POINTS, POINTS_BLURB } from "@/lib/products";
import { ProductGrid, SectionTitle } from "@/components/site";

export const Route = createFileRoute("/points")({
  head: () => ({
    meta: [
      { title: "Points — GAMERSTEAL Store" },
      { name: "description", content: "Browse GAMERSTEAL SMP points packs for Minecraft. Use points toward kill effects, elytra trails, spawners, chat tags and chat colors in your Survival adventure." },
      { property: "og:title", content: "Points — GAMERSTEAL Store" },
      { property: "og:description", content: "Points for GAMERSTEAL Survival SMP — kill effects, elytra trails, spawners, chat tags & colors." },
      { property: "og:url", content: "https://shop.tgadev.online/points" },
    ],
    links: [{ rel: "canonical", href: "https://shop.tgadev.online/points" }],
  }),
  staticData: { sitemap: true },
  component: () => (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <SectionTitle eyebrow="Points Store" title="POINTS" sub={POINTS_BLURB} />
      <ProductGrid products={POINTS} />
    </section>
  ),
});
