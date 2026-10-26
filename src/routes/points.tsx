import { createFileRoute } from "@tanstack/react-router";
import { POINTS, POINTS_BLURB } from "@/lib/products";
import { ProductGrid, SectionTitle } from "@/components/site";

export const Route = createFileRoute("/points")({
  head: () => ({
    meta: [
      { title: "Points — GAMERSTEAL Store" },
      { name: "description", content: "Buy GAMERSTEAL points from ₹10. Spend them on kill effects, elytra trails, spawners, chat tags and chat colors." },
      { property: "og:title", content: "Points — GAMERSTEAL Store" },
      { property: "og:description", content: "Points for GAMERSTEAL Survival SMP — kill effects, elytra trails, spawners, chat tags & colors." },
    ],
  }),
  component: () => (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <SectionTitle eyebrow="Points Store" title="POINTS" sub={POINTS_BLURB} />
      <ProductGrid products={POINTS} />
    </section>
  ),
});
