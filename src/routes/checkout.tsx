import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useCart } from "@/lib/cart";
import { formatINR } from "@/lib/products";
import { effectivePrice } from "@/lib/sale";
import { btn, DiscordButton, SectionTitle } from "@/components/site";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — GAMERSTEAL Store" },
      { name: "description", content: "Complete your GAMERSTEAL order." },
      { property: "og:title", content: "Checkout — GAMERSTEAL Store" },
      { property: "og:description", content: "Complete your GAMERSTEAL order." },
    ],
  }),
  component: Checkout,
});

const USERNAME = /^\.?[A-Za-z0-9_]{3,16}$/; // "." prefix for Bedrock players

function Checkout() {
  const { lines, total } = useCart();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [edition, setEdition] = useState<"java" | "bedrock">("java");
  const [state, setState] = useState<"idle" | "loading" | "unavailable">("idle");
  const [err, setErr] = useState("");

  if (lines.length === 0)
    return (
      <section className="mx-auto max-w-xl px-4 py-16 text-center">
        <SectionTitle eyebrow="Checkout" title="NOTHING HERE" />
        <Link to="/ranks" className={btn.primary}>Browse the store</Link>
      </section>
    );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (!USERNAME.test(name.trim())) return setErr("Enter a valid Minecraft username (3–16 letters, numbers or _).");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setErr("Enter a valid email address.");
    setState("loading");
    // TODO: call secure server-side payment session here once payments are connected.
    await new Promise((r) => setTimeout(r, 700));
    setState("unavailable");
  };

  const input = "w-full rounded-lg border border-input bg-background/60 px-4 py-3 outline-none focus:border-primary focus:shadow-glow";

  return (
    <section className="mx-auto max-w-4xl px-4 py-16">
      <SectionTitle eyebrow="Secure checkout" title="CHECKOUT" />
      <div className="grid gap-6 md:grid-cols-[1fr_300px]">
        <form onSubmit={submit} className="glass space-y-4 rounded-2xl p-6" noValidate>
          <div className="grid grid-cols-2 gap-2">
            {(["java", "bedrock"] as const).map((ed) => (
              <button type="button" key={ed} onClick={() => setEdition(ed)} className={`rounded-lg border px-4 py-2.5 text-sm font-bold uppercase ${edition === ed ? "border-primary bg-primary/20 shadow-glow" : "border-input"}`}>{ed}</button>
            ))}
          </div>
          <label className="block text-sm">Minecraft username
            <input className={`${input} mt-1`} value={name} onChange={(e) => setName(e.target.value)} placeholder={edition === "bedrock" ? ".YourName" : "YourName"} />
          </label>
          <label className="block text-sm">Email (for your receipt)
            <input type="email" className={`${input} mt-1`} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </label>
          {err && <p className="text-sm text-destructive" role="alert">{err}</p>}
          {state === "unavailable" ? (
            <div className="rounded-xl border border-gold/50 bg-gold/10 p-4 text-sm" role="status">
              <p className="flex items-center gap-2 font-bold text-gold"><AlertTriangle className="h-4 w-4" /> Online payments aren't live yet</p>
              <p className="mt-2 text-muted-foreground">No payment was taken. To buy now, open a ticket on our Discord and our team will help you.</p>
              <DiscordButton label="Open a ticket on Discord" className={`${btn.primary} mt-4 w-full`} />
            </div>
          ) : (
            <button disabled={state === "loading"} className={`${btn.primary} w-full`}>
              {state === "loading" ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</> : `Pay ${formatINR(total)}`}
            </button>
          )}
        </form>
        <aside className="glass h-fit space-y-3 rounded-2xl p-6">
          {lines.map(({ id, qty, product: p }) => (
            <div key={id} className="flex justify-between text-sm"><span>{p.name} ×{qty}</span><span>{formatINR((effectivePrice(p) ?? 0) * qty)}</span></div>
          ))}
          <div className="flex justify-between border-t border-border pt-3 font-display text-lg"><span>Total</span><span>{formatINR(total)}</span></div>
        </aside>
      </div>
    </section>
  );
}
