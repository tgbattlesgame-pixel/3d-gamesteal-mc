import r0 from "@/assets/ranks-0.jpg";
import r1 from "@/assets/ranks-1.jpg";
import r2 from "@/assets/ranks-2.jpg";
import r3 from "@/assets/ranks-3.jpg";
import k0 from "@/assets/keys-0.jpg";
import k1 from "@/assets/keys-1.jpg";
import k2 from "@/assets/keys-2.jpg";
import k3 from "@/assets/keys-3.jpg";

export const SERVER = {
  name: "GAMERSTEAL",
  ip: "PLAY.GAMERSTEAL.ONLINE",
  store: "SHOP.GAMERSTEAL.ONLINE",
  mode: "LifeSteal SMP",
  season: "Season 1",
  discord: "https://discord.gg/BQ9wFAMJU",
};

export type Product = {
  id: string;
  kind: "rank" | "key";
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
  { id: "eternal", kind: "rank", name: "ETERNAL", price: 100, image: r0, tagline: "Begin your legacy.", perks: ["Perks to be announced"] },
  { id: "elite", kind: "rank", name: "ELITE", price: 200, image: r1, tagline: "Stand above the rest.", perks: ["Perks to be announced"] },
  { id: "divine", kind: "rank", name: "DIVINE", price: 300, image: r2, tagline: "Blessed by the gods.", perks: ["Perks to be announced"] },
  { id: "gamer", kind: "rank", name: "GAMER", price: 500, image: r3, tagline: "The ultimate rank.", perks: ["Perks to be announced"], featured: true },
];

export const KEYS: Product[] = [
  { id: "common-key", kind: "key", name: "Common Key", price: null, image: k0, tagline: "Opens the Common Crate.", perks: ["Rewards to be announced"] },
  { id: "rare-key", kind: "key", name: "Rare Key", price: null, image: k1, tagline: "Opens the Rare Crate.", perks: ["Rewards to be announced"] },
  { id: "epic-key", kind: "key", name: "Epic Key", price: null, image: k2, tagline: "Opens the Epic Crate.", perks: ["Rewards to be announced"] },
  { id: "legendary-key", kind: "key", name: "Legendary Key", price: null, image: k3, tagline: "Opens the Legendary Crate.", perks: ["Rewards to be announced"], featured: true },
];

export const ALL_PRODUCTS = [...RANKS, ...KEYS];

export const formatINR = (n: number | null) =>
  n === null ? "Price TBA" : `₹${n.toLocaleString("en-IN")}`;
