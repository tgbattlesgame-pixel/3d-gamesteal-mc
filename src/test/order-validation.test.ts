import { describe, expect, it } from "vitest";
import {
  buildOrderItems,
  isValidOrderStatus,
  isValidProofPath,
  validateEmail,
  validateMcUsername,
  validateOrderCode,
} from "@/lib/order-helpers";

const pid = (n: string) => ({ id: n, qty: 1 });

describe("Username validation", () => {
  it("accepts 3-16 char usernames", () => {
    expect(validateMcUsername("GamerAdept")).toBeNull();
    expect(validateMcUsername(".BedrockPlayer")).toBeNull(); // Bedrock dot prefix
  });
  it("rejects too-short or invalid names", () => {
    expect(validateMcUsername("ab")).not.toBeNull();
    expect(validateMcUsername("has space!")).not.toBeNull();
  });
});

describe("Email validation", () => {
  it("rejects bad emails", () => {
    expect(validateEmail("nope")).not.toBeNull();
    expect(validateEmail("a@b.c")).toBeNull();
  });
});

describe("Order totals are recomputed server-side", () => {
  it("charges regular prices with no sale", () => {
    const built = buildOrderItems([pid("destroyer"), { id: "points-100", qty: 2 }]);
    if ("error" in built) throw new Error(built.error);
    expect(built.items.map((i) => i.price)).toEqual([100, 10]);
    expect(built.total).toBe(120); // 100 + 2×10, exact
  });
  it("multiplies point pack quantities", () => {
    const built = buildOrderItems([{ id: "points-1000", qty: 3 }]);
    if ("error" in built) throw new Error(built.error);
    expect(built.total).toBe(180); // 3 × 60
  });
  it("rejects unknown products and empty carts", () => {
    expect(buildOrderItems([pid("no-such-item")]).error).toBeTruthy();
    expect(buildOrderItems([]).error).toBeTruthy();
  });
  it("rejects quantity over 99 and rank duplicates", () => {
    expect(buildOrderItems([{ id: "points-100", qty: 100 }]).error).toBeTruthy();
    expect(buildOrderItems([{ id: "gamer", qty: 2 }]).error).toBeTruthy();
  });
});

describe("Order codes", () => {
  it("accepts GS-AB12CD style codes, rejects confusable chars", () => {
    expect(validateOrderCode("GS-AB12CD")).toBe(true);
    expect(validateOrderCode("gs-ab12cd")).toBe(false); // must be uppercase
    expect(validateOrderCode("GS-AO12CD")).toBe(false); // O not allowed
  });
  it("generates valid codes", () => {
    for (let i = 0; i < 20; i++) expect(validateOrderCode(genCode())).toBe(true);
  });
});

import { genOrderCode } from "@/lib/order-helpers";
function genCode() {
  return genOrderCode();
}

describe("Proof paths and statuses", () => {
  it("only allows uploads under proofs/<code>/", () => {
    expect(isValidProofPath("GS-AB12CD", "proofs/GS-AB12CD/pay.png")).toBe(true);
    expect(isValidProofPath("GS-AB12CD", "proofs/GS-XY89ZW/pay.png")).toBe(false);
    expect(isValidProofPath("GS-AB12CD", "proofs/GS-AB12CD/../evil.png")).toBe(false);
    expect(isValidProofPath("GS-AB12CD", "other/pay.png")).toBe(false);
  });
  it("accepts only the four order statuses", () => {
    expect(isValidOrderStatus("pending")).toBe(true);
    expect(isValidOrderStatus("delivered")).toBe(true);
    expect(isValidOrderStatus("hacked")).toBe(false);
  });
});
