import { describe, expect, it } from "vitest";
import { RANKS, formatINR } from "@/lib/products";
import { isSaleActive, salePrice, effectivePrice } from "@/lib/sale";

// IST is UTC+5:30 year-round, so IST wall-clock times map to fixed UTC instants.
const IST = (y: number, mo: number, d: number, h: number, mi: number) =>
  Date.UTC(y, mo - 1, d, h - 5, mi - 30);

const byId = (id: string) => RANKS.find((r) => r.id === id)!;

describe("15% sale window (Asia/Kolkata)", () => {
  it("is inactive before 25 Oct 2026 00:00 IST", () => {
    expect(isSaleActive(IST(2026, 10, 24, 23, 59))).toBe(false);
  });
  it("is active from 25 Oct 2026 00:00 IST", () => {
    expect(isSaleActive(IST(2026, 10, 25, 0, 0))).toBe(true);
  });
  it("stays active through the last minute of 5 Nov 2026 IST", () => {
    expect(isSaleActive(IST(2026, 11, 5, 23, 59))).toBe(true);
  });
  it("expires at 6 Nov 2026 00:00 IST", () => {
    expect(isSaleActive(IST(2026, 11, 6, 0, 0))).toBe(false);
  });
});

describe("Rank lineup", () => {
  it("lists ranks in order DESTROYER, TITAN, DEADLIEST, GAMER", () => {
    expect(RANKS.map((r) => r.id)).toEqual(["destroyer", "titan", "deadliest", "gamer"]);
  });
  it("uses the owner-set regular prices 100/150/200/250", () => {
    expect(RANKS.map((r) => r.price)).toEqual([100, 150, 200, 250]);
  });
});

describe("Sale pricing", () => {
  it("charges exactly 15% off during the sale", () => {
    expect(salePrice(byId("destroyer"))).toBe(85);
    expect(salePrice(byId("titan"))).toBe(127.5);
    expect(salePrice(byId("deadliest"))).toBe(170);
    expect(salePrice(byId("gamer"))).toBe(212.5);
  });
  it("restores regular prices outside the sale", () => {
    const before = IST(2026, 10, 1, 12, 0);
    const after = IST(2026, 12, 1, 12, 0);
    for (const r of RANKS) {
      expect(effectivePrice(r, before)).toBe(r.price);
      expect(effectivePrice(r, after)).toBe(r.price);
    }
  });
  it("charges sale prices during the sale window", () => {
    const now = IST(2026, 10, 30, 12, 0);
    expect(effectivePrice(byId("titan"), now)).toBe(127.5);
    expect(effectivePrice(byId("gamer"), now)).toBe(212.5);
  });
});

describe("Price formatting", () => {
  it("formats whole rupees without decimals", () => {
    expect(formatINR(85)).toBe("₹85");
    expect(formatINR(100)).toBe("₹100");
  });
  it("formats decimal sale prices with paise", () => {
    expect(formatINR(127.5)).toBe("₹127.50");
    expect(formatINR(212.5)).toBe("₹212.50");
  });
});
