import { createFileRoute, Link } from "@tanstack/react-router";
import hero from "@/assets/hero-bg.jpg";
import logo from "@/assets/gamersteal-logo.png";
import { RANKS, SERVER } from "@/lib/products";
import { btn, CopyIP, DiscordButton, ProductGrid, SectionTitle } from "@/components/site";
import { ServerStatusPanel } from "@/components/server-status";
import { Crown, LandPlot, Swords, ShoppingCart, Ticket, MessageSquareText, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GAMERSTEAL — Survival SMP Store" },
      { name: "description", content: "Official GAMERSTEAL Survival SMP store. Buy ranks and claim your land. Play at PLAY.TGADEV.ONLINE." },
      { property: "og:title", content: "GAMERSTEAL — Survival SMP Store" },
      { property: "og:description", content: "Your land. Your power. Your legacy. Ranks for GAMERSTEAL Survival SMP." },
    ],
  }),
  component: Index,
});

const particles = Array.from({ length: 18 }, (_, i) => ({ left: (i * 37) % 100, delay: (i * 0.7) % 8, dur: 8 + (i % 5) * 2, red: i % 3 === 0 }));

function Index() {
  return (
    <>
      <section className="relative isolate flex min-h-[calc(100svh-4rem)] items-center overflow-hidden">
        <img src={hero} alt="" width={1920} height={1088} className="absolute inset-0 -z-20 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background/40 via-background/60 to-background" />
        <div className="pointer-events-none absolute inset-0 -z-10">
          {particles.map((p, i) => (
            <span key={i} className={`particle ${p.red ? "red" : ""}`} style={{ left: `${p.left}%`, animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s` }} />
          ))}
        </div>
        <div className="mx-auto flex max-w-4xl flex-col items-center px-4 py-16 text-center">
          <span className="glass pulse-glow mb-6 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-[0.25em]">Survival SMP • Season 1</span>
          <h1 className="sr-only">GAMERSTEAL</h1>
          <img src={logo} alt="GAMERSTEAL MC" className="float-slow w-full max-w-2xl drop-shadow-[0_0_40px_var(--primary)]" />
          <p className="mt-6 font-display text-lg tracking-[0.2em] sm:text-2xl">YOUR LAND. YOUR POWER. <span className="text-brand">YOUR LEGACY.</span></p>
          <p className="mt-4 max-w-xl text-muted-foreground">Enter the world of GAMERSTEAL Survival SMP. Build, survive, claim your land, and become a legend.</p>
          <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link to="/ranks" className={btn.primary}>Explore Store</Link>
            <DiscordButton />
          </div>
          <div className="mt-8"><CopyIP big /></div>
          <div className="mt-4 w-full px-2"><ServerStatusPanel /></div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { icon: LandPlot, t: "Claim your land", d: "Protect your base with the land claim system — nobody touches what's yours." },
            { icon: Crown, t: "Unlock ranks", d: "Stand out on the server with a GAMERSTEAL rank." },
            { icon: Swords, t: "Fight & survive", d: "Pure survival — battle mobs and players in a wild open world." },
          ].map(({ icon: I, t, d }) => (
            <div key={t} className="glass rounded-2xl p-6 transition hover:shadow-glow">
              <I className="h-8 w-8 text-primary" />
              <h3 className="mt-4 text-xl">{t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="ranks" className="mx-auto max-w-7xl px-4 py-12">
        <SectionTitle eyebrow="Rank Store" title="RANKS" sub="Explore ranks to enhance your GAMERSTEAL experience." />
        <ProductGrid products={RANKS} />
      </section>

      <section id="how-to-buy" className="mx-auto max-w-7xl px-4 py-12">
        <SectionTitle eyebrow="Simple & fast" title="HOW TO BUY" sub="Get your rank in a few easy steps." />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: ShoppingCart, t: "1. Pick your rank", d: "Add a rank to your cart and head to checkout." },
            { icon: Ticket, t: "2. Create a ticket", d: "Open a ticket in our Discord server — our team is always there to help." },
            { icon: MessageSquareText, t: "3. Share your details", d: "Tell us your Minecraft username (Java or Bedrock) and what you're buying." },
            { icon: Sparkles, t: "4. Pay & get your gear", d: "Pay using the method our team shares, and your rank is delivered in-game." },
          ].map(({ icon: I, t, d }) => (
            <div key={t} className="glass rounded-2xl p-6 transition hover:shadow-glow">
              <I className="h-8 w-8 text-primary" />
              <h3 className="mt-4 text-lg font-bold uppercase tracking-wider">{t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <DiscordButton label="Create a ticket on Discord" className={btn.primary} />
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16">
        <div className="glass relative overflow-hidden rounded-3xl p-8 text-center shadow-glow sm:p-12">
          <h2 className="text-3xl sm:text-4xl">Ready to join <span className="text-brand">{SERVER.name}</span>?</h2>
          <p className="mt-3 text-muted-foreground">Java + Bedrock • {SERVER.mode} • {SERVER.season} • Land claim system</p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <CopyIP big />
            <DiscordButton label="Join our Discord" className={btn.primary} />
          </div>
        </div>
      </section>
    </>
  );
}
