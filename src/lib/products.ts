import r0 from "@/assets/ranks-0.jpg";
import r2 from "@/assets/ranks-2.jpg";
import r4 from "@/assets/ranks-4.jpg";
import r5 from "@/assets/ranks-5.jpg";
import titan from "@/assets/ranks-titan.jpg";
import p100 from "@/assets/points-100.jpg";
import p250 from "@/assets/points-250.jpg";
import p500 from "@/assets/points-500.jpg";
import p1000 from "@/assets/points-1000.jpg";
import p2500 from "@/assets/points-2500.jpg";
import p5000 from "@/assets/points-5000.jpg";

export const SERVER = {
  name: "GAMERSTEAL",
  ip: "PLAY.TGADEV.ONLINE",
  store: "SHOP.GAMERSTEAL.ONLINE",
  mode: "Survival SMP",
  season: "Season 1",
  discord: "https://discord.gg/HaNwU9zukt",
  owner: "TheGamerAdept",
  poweredBy: "TGA",
};

export type Product = {
  id: string;
  kind: "rank" | "points";
  name: string;
  /** Regular price in INR. null = not set yet (placeholder). */
  price: number | null;
  image: string;
  tagline: string;
  /** Perks — edit these once real benefits are decided. */
  perks: string[];
  featured?: boolean;
};

/** What points can be spent on in-game. */
export const POINTS_PERKS = ["Kill effects", "Elytra trails", "Spawners", "Chat tags", "Chat colors"];
export const POINTS_BLURB = "Spend points on kill effects, elytra trails, spawners, chat tags & chat colors.";

// ✏️ Edit products here.
export const RANKS: Product[] = [
  { id: "destroyer", kind: "rank", name: "DESTROYER", price: 100, image: r0, tagline: "Break everything in your path.", perks: ["Perks to be announced"] },
  { id: "titan", kind: "rank", name: "TITAN", price: 150, image: titan, tagline: "A giant among survivors.", perks: ["Perks to be announced"] },
  { id: "deadliest", kind: "rank", name: "DEADLIEST", price: 200, image: r4, tagline: "Feared by every player.", perks: ["Perks to be announced"] },
  { id: "gamer", kind: "rank", name: "GAMER", price: 250, image: r5, tagline: "The ultimate rank.", perks: ["Perks to be announced"], featured: true },
];

export const POINTS: Product[] = [
  { id: "points-100", kind: "points", name: "100 Points", price: 10, image: p100, tagline: "A small stash to get started.", perks: POINTS_PERKS },
  { id: "points-250", kind: "points", name: "250 Points", price: 20, image: p250, tagline: "A little extra for cosmetics.", perks: POINTS_PERKS },
  { id: "points-500", kind: "points", name: "500 Points", price: 35, image: p500, tagline: "Plenty for spawners and trails.", perks: POINTS_PERKS },
  { id: "points-1000", kind: "points", name: "1,000 Points", price: 60, image: p1000, tagline: "A solid stash of points.", perks: POINTS_PERKS },
  { id: "points-2500", kind: "points", name: "2,500 Points", price: 120, image: p2500, tagline: "A big stash for serious spenders.", perks: POINTS_PERKS },
  { id: "points-5000", kind: "points", name: "5,000 Points", price: 200, image: p5000, tagline: "The ultimate point pack.", perks: POINTS_PERKS, featured: true },
];

export const ALL_PRODUCTS = [...RANKS, ...POINTS];

export const formatINR = (n: number | null) =>
  n === null
    ? "Price TBA"
    : `₹${n.toLocaleString("en-IN", {
        minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
        maximumFractionDigits: 2,
      })}`;
