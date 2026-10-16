import r0 from "@/assets/ranks-0.jpg";
import r1 from "@/assets/ranks-1.jpg";
import r2 from "@/assets/ranks-2.jpg";
import r3 from "@/assets/ranks-3.jpg";
import r4 from "@/assets/ranks-4.jpg";
import r5 from "@/assets/ranks-5.jpg";
import k0 from "@/assets/keys-0.jpg";
import k1 from "@/assets/keys-1.jpg";
import k2 from "@/assets/keys-2.jpg";
import k3 from "@/assets/keys-3.jpg";
import k4 from "@/assets/keys-4.jpg";

export const SERVER = {
  name: "GAMERSTEAL",
  ip: "PLAY.GAMERSTEAL.ONLINE",
  store: "SHOP.GAMERSTEAL.ONLINE",
  mode: "LifeSteal SMP",
  season: "Season 1",
  discord: "https://discord.gg/BQ9wFAMJU",
  owner: "TheGamerAdept",
  poweredBy: "TGA",
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
  { id: "destroyer", kind: "rank", name: "DESTROYER", price: 100, image: r0, tagline: "Break everything in your path.", perks: ["Perks to be announced"] },
  { id: "immortal", kind: "rank", name: "IMMORTAL", price: 150, image: r1, tagline: "Death can't hold you down.", perks: ["Perks to be announced"] },
  { id: "divine", kind: "rank", name: "DIVINE", price: 200, image: r2, tagline: "Blessed by the gods.", perks: ["Perks to be announced"] },
  { id: "king", kind: "rank", name: "KING", price: 250, image: r3, tagline: "Rule the server.", perks: ["Perks to be announced"] },
  { id: "deadliest", kind: "rank", name: "DEADLIEST", price: 300, image: r4, tagline: "Feared by every player.", perks: ["Perks to be announced"] },
  { id: "gamer", kind: "rank", name: "GAMER", price: 400, image: r5, tagline: "The ultimate rank.", perks: ["Perks to be announced"], featured: true },
];

export const KEYS: Product[] = [
  { id: "secret-key", kind: "key", name: "Secret Key", price: 30, image: k0, tagline: "Opens the Secret Crate.", perks: ["Rewards to be announced"] },
  { id: "eternal-key", kind: "key", name: "Eternal Key", price: 60, image: k1, tagline: "Opens the Eternal Crate.", perks: ["Rewards to be announced"] },
  { id: "cosmic-key", kind: "key", name: "Cosmic Key", price: 120, image: k2, tagline: "Opens the Cosmic Crate.", perks: ["Rewards to be announced"] },
  { id: "enchanted-key", kind: "key", name: "Enchanted Key", price: 150, image: k3, tagline: "Opens the Enchanted Crate.", perks: ["Rewards to be announced"] },
  { id: "gamer-key", kind: "key", name: "Gamer Key", price: 200, image: k4, tagline: "Opens the Gamer Crate.", perks: ["Rewards to be announced"], featured: true },
];

export const ALL_PRODUCTS = [...RANKS, ...KEYS];

export const formatINR = (n: number | null) =>
  n === null ? "Price TBA" : `₹${n.toLocaleString("en-IN")}`;
