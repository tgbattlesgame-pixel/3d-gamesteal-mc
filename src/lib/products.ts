import r0 from "@/assets/ranks-0.jpg";
import r2 from "@/assets/ranks-2.jpg";
import r4 from "@/assets/ranks-4.jpg";
import r5 from "@/assets/ranks-5.jpg";
import titan from "@/assets/ranks-titan.jpg";

export const SERVER = {
  name: "GAMERSTEAL",
  ip: "PLAY.TGADEV.ONLINE",
  store: "SHOP.GAMERSTEAL.ONLINE",
  mode: "Survival SMP",
  season: "Season 1",
  discord: "https://discord.gg/BQ9wFAMJU",
  owner: "TheGamerAdept",
  poweredBy: "TGA",
};

export type Product = {
  id: string;
  kind: "rank";
  name: string;
  /** Price in INR. null = not set yet (placeholder). */
  price: number | null;
  image: string;
  tagline: string;
  /** Perks — edit these once real benefits are decided. */
  perks: string[];
  featured?: boolean;
};

// ✏️ Edit products here.
export const RANKS: Product[] = [
  { id: "destroyer", kind: "rank", name: "DESTROYER", price: 100, image: r0, tagline: "Break everything in your path.", perks: ["Perks to be announced"] },
  { id: "titan", kind: "rank", name: "TITAN", price: 200, image: titan, tagline: "A giant among survivors.", perks: ["Perks to be announced"] },
  { id: "deadliest", kind: "rank", name: "DEADLIEST", price: 300, image: r4, tagline: "Feared by every player.", perks: ["Perks to be announced"] },
  { id: "gamer", kind: "rank", name: "GAMER", price: 400, image: r5, tagline: "The ultimate rank.", perks: ["Perks to be announced"], featured: true },
];

export const ALL_PRODUCTS = [...RANKS];

export const formatINR = (n: number | null) =>
  n === null ? "Price TBA" : `₹${n.toLocaleString("en-IN")}`;
