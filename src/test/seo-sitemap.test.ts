import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectFile = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("static sitemap", () => {
  const xml = projectFile("public/sitemap.xml");

  it("uses the XML declaration and the sitemap protocol namespace", () => {
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
  });

  it("lists the three requested public pages as separate url and loc elements", () => {
    const urls = [...xml.matchAll(/<url>\s*<loc>([^<]+)<\/loc>\s*<\/url>/g)].map((match) => match[1]);
    expect(urls).toEqual([
      "https://shop.tgadev.online/",
      "https://shop.tgadev.online/points",
      "https://shop.tgadev.online/ranks",
    ]);
  });

  it("sets the sitemap content type for Vercel", () => {
    const config = JSON.parse(projectFile("vercel.json")) as {
      headers: { source: string; headers: { key: string; value: string }[] }[];
    };
    expect(config.headers).toContainEqual({
      source: "/sitemap.xml",
      headers: [{ key: "Content-Type", value: "application/xml; charset=utf-8" }],
    });
  });
});