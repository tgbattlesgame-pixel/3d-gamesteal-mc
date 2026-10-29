import { describe, expect, it } from "vitest";
import { RANKS, POINTS, formatINR, SERVER } from "@/lib/products";

describe("Rank lineup", () => {
  it("lists ranks in order DESTROYER, TITAN, DEADLIEST, GAMER", () => {
    expect(RANKS.map((r) => r.id)).toEqual(["destroyer", "titan", "deadliest", "gamer"]);
  });
  it("uses the owner-set regular prices 100/150/200/250", () => {
    expect(RANKS.map((r) => r.price)).toEqual([100, 150, 200, 250]);
  });
});

describe("Points lineup", () => {
  it("lists the six owner-set point packs with prices", () => {
    expect(POINTS.map((p) => p.price)).toEqual([10, 20, 35, 60, 120, 200]);
  });
});

describe("Price formatting", () => {
  it("formats whole rupees without decimals", () => {
    expect(formatINR(85)).toBe("₹85");
    expect(formatINR(100)).toBe("₹100");
  });
  it("formats decimal prices with paise", () => {
    expect(formatINR(127.5)).toBe("₹127.50");
    expect(formatINR(212.5)).toBe("₹212.50");
  });
});

describe("Server config", () => {
  it("uses the current Discord invite link", () => {
    expect(SERVER.discord).toBe("https://discord.gg/HaNwU9zukt");
  });
  it("uses the corrected server address", () => {
    expect(SERVER.ip).toBe("PLAY.TGADEV.ONLINE");
  });
});
