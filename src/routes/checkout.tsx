import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Check, CheckCircle2, Copy, ImageUp, Loader2, MessageSquareText, Smartphone, X } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/lib/cart";
import { formatINR } from "@/lib/products";
import { createOrder, submitProof } from "@/lib/orders.functions";
import { validateEmail, validateMcUsername } from "@/lib/order-helpers";
import { supabase } from "@/integrations/supabase/client";
import { btn, DiscordButton, SectionTitle } from "@/components/site";
import upiQr from "@/assets/upi-qr.png";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — GAMERSTEAL Store" },
      { name: "description", content: "Pay with UPI and complete your GAMERSTEAL order." },
      { property: "og:title", content: "Checkout — GAMERSTEAL Store" },
      { property: "og:description", content: "Pay with UPI and complete your GAMERSTEAL order." },
    ],
  }),
  component: Checkout,
});

const UPI_ID = "tgadevs@okhdfcbank";
const UPI_NAME = "TGA DEVS";
const MAX_PROOF_MB = 10;

function Checkout() {
  const { lines, total, clear } = useCart();
  const createOrderFn = useServerFn(createOrder);
  const submitProofFn = useServerFn(submitProof);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [edition, setEdition] = useState<"java" | "bedrock">("java");
  const [step, setStep] = useState<"form" | "pay" | "done">("form");
  const [order, setOrder] = useState<{ code: string; total: number } | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<"idle" | "placing" | "uploading">("idle");
  const [err, setErr] = useState("");
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  if (lines.length === 0 && step === "form")
    return (
      <section className="mx-auto max-w-xl px-4 py-16 text-center">
        <SectionTitle eyebrow="Checkout" title="NOTHING HERE" />
        <Link to="/ranks" className={btn.primary}>
          Browse the store
        </Link>
      </section>
    );

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    const uErr = validateMcUsername(name);
    if (uErr) return setErr(uErr);
    const eErr = validateEmail(email);
    if (eErr) return setErr(eErr);
    setState("placing");
    try {
      const res = await createOrderFn({
        data: { mcUsername: name, email, edition, items: lines.map((l) => ({ id: l.id, qty: l.qty })) },
      });
      if (res.error) return setErr(res.error);
      const placed = res as { code: string; total: number };
      setOrder({ code: placed.code, total: placed.total });
      setStep("pay");
    } catch {
      setErr("Something went wrong while creating your order. Please try again.");
    } finally {
      setState("idle");
    }
  };

  const uploadPath = (code: string, f: File) =>
    `proofs/${code}/${Date.now()}-${f.name.replace(/[^A-Za-z0-9._-]/g, "_").slice(-60)}`;

  const sendProof = async () => {
    if (!order || !file) return;
    setErr("");
    if (file.size > MAX_PROOF_MB * 1024 * 1024) return setErr(`Screenshot must be under ${MAX_PROOF_MB} MB.`);
    setState("uploading");
    const path = uploadPath(order.code, file);
    try {
      const { error: upErr } = await supabase.storage.from("payment-proofs").upload(path, file, {
        cacheControl: "3600",
        contentType: file.type || "image/png",
      });
      if (upErr) {
        console.error("proof upload failed:", upErr);
        return setErr("Could not upload the screenshot. Try again.");
      }
      const res = await submitProofFn({ data: { code: order.code, path } });
      if (res.error) return setErr(res.error);
      clear();
      setStep("done");
    } catch {
      setErr("Something went wrong. Please try again.");
    } finally {
      setState("idle");
    }
  };

  const input =
    "w-full rounded-lg border border-input bg-background/60 px-4 py-3 outline-none focus:border-primary focus:shadow-glow";

  return (
    <section className="mx-auto max-w-4xl px-4 py-16">
      <SectionTitle
        eyebrow="Secure checkout"
        title={step === "form" ? "CHECKOUT" : step === "pay" ? "PAY WITH UPI" : "ORDER PLACED"}
      />

      {step === "form" && (
        <div className="grid gap-6 md:grid-cols-[1fr_300px]">
          <form onSubmit={placeOrder} className="glass space-y-4 rounded-2xl p-6" noValidate>
            <div className="grid grid-cols-2 gap-2">
              {(["java", "bedrock"] as const).map((ed) => (
                <button
                  type="button"
                  key={ed}
                  onClick={() => setEdition(ed)}
                  className={`rounded-lg border px-4 py-2.5 text-sm font-bold uppercase ${
                    edition === ed ? "border-primary bg-primary/20 shadow-glow" : "border-input"
                  }`}
                >
                  {ed}
                </button>
              ))}
            </div>
            <label className="block text-sm">
              Minecraft username
              <input className={`${input} mt-1`} value={name} onChange={(e) => setName(e.target.value)} placeholder={edition === "bedrock" ? ".YourName" : "YourName"} />
            </label>
            <label className="block text-sm">
              Email (for your receipt)
              <input type="email" className={`${input} mt-1`} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </label>
            {err && (
              <p className="text-sm text-destructive" role="alert">
                {err}
              </p>
            )}
            <button disabled={state !== "idle"} className={`${btn.primary} w-full`}>
              {state === "placing" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Creating order…
                </>
              ) : (
                `Continue — pay ${formatINR(total)}`
              )}
            </button>
            <p className="text-xs text-muted-foreground">Next step: scan the UPI QR and pay with Google Pay, PhonePe or Paytm.</p>
          </form>
          <OrderSummary lines={lines} total={total} />
        </div>
      )}

      {step === "pay" && order && (
        <div className="grid gap-6 md:grid-cols-[1fr_300px]">
          <div className="glass space-y-4 rounded-2xl p-6">
            <ol className="space-y-1 text-sm text-muted-foreground">
              <li>
                <span className="font-bold text-foreground">1.</span> Scan the QR with any UPI app and pay{" "}
                <span className="font-bold text-foreground">{formatINR(order.total)}</span> exactly.
              </li>
              <li>
                <span className="font-bold text-foreground">2.</span> Take a screenshot of the payment success screen.
              </li>
              <li>
                <span className="font-bold text-foreground">3.</span> Upload the screenshot below — our team verifies it and delivers in-game.
              </li>
            </ol>
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-background/40 p-4">
              <img src={upiQr} alt="UPI payment QR code" className="h-56 w-auto rounded-lg bg-white p-2" />
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Scan to pay with any UPI app</p>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(UPI_ID);
                    setCopiedUpi(true);
                    toast.success("UPI ID copied!");
                    setTimeout(() => setCopiedUpi(false), 1800);
                  } catch {
                    toast.error("Couldn't copy — please copy it manually.");
                  }
                }}
                className="glass inline-flex items-center gap-2 rounded-xl px-4 py-2 font-display tracking-wider"
              >
                {copiedUpi ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
                {UPI_ID}
              </button>
              <a
                href={`upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${order.total}&cu=INR&tn=${encodeURIComponent("GAMERSTEAL " + order.code)}`}
                className={`${btn.primary} sm:hidden`}
              >
                <Smartphone className="h-4 w-4" /> Open UPI app
              </a>
            </div>

            <label className="block cursor-pointer text-sm">
              <span className="mb-1 block font-bold uppercase tracking-wider">Payment screenshot</span>
              <span className="flex items-center gap-3 rounded-xl border border-dashed border-border bg-background/40 px-4 py-3 hover:border-primary">
                <ImageUp className="h-5 w-5 text-primary" />
                <span className="truncate text-sm">{file ? file.name : "Choose screenshot (PNG or JPG)"}</span>
                {file && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setFile(null);
                    }}
                    className="ml-auto rounded-md bg-background/70 p-1.5"
                    aria-label="Remove screenshot"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </span>
              <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </label>
            {err && (
              <p className="text-sm text-destructive" role="alert">
                {err}
              </p>
            )}
            <button onClick={sendProof} disabled={!file || state !== "idle"} className={`${btn.primary} w-full`}>
              {state === "uploading" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Uploading…
                </>
              ) : (
                "I've paid — submit screenshot"
              )}
            </button>
            <p className="text-center text-xs text-muted-foreground">
              No payment was taken by this website — you pay directly through UPI. Your order code:{" "}
              <span className="font-display text-foreground">{order.code}</span>
            </p>
          </div>
          <OrderSummary lines={lines} total={order.total} />
        </div>
      )}

      {step === "done" && order && (
        <div className="glass mx-auto max-w-xl space-y-4 rounded-2xl p-8 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
          <h2 className="text-2xl">Screenshot submitted!</h2>
          <p className="text-sm text-muted-foreground">
            Our team will verify your payment and deliver in-game. Keep your order code — use it any time to check the status and chat with us.
          </p>
          <div className="mx-auto flex w-fit items-center gap-3 rounded-xl border border-primary/50 bg-primary/10 px-5 py-3">
            <span className="font-display text-2xl tracking-widest">{order.code}</span>
            <button
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(order.code);
                  setCopiedCode(true);
                  setTimeout(() => setCopiedCode(false), 1800);
                } catch {
                  toast.error("Couldn't copy — write it down.");
                }
              }}
              className="rounded-md p-1.5 hover:bg-background/60"
              aria-label="Copy order code"
            >
              {copiedCode ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Link to="/chat" search={{ code: order.code }} className={btn.primary}>
              <MessageSquareText className="h-4 w-4" /> Open order chat
            </Link>
            <Link to="/ranks" className={btn.ghost}>
              Back to the store
            </Link>
          </div>
          <div className="pt-2">
            <DiscordButton label="Need help? Ask on Discord" className={`${btn.ghost} !text-xs`} />
          </div>
        </div>
      )}
    </section>
  );
}

function OrderSummary({ lines, total }: { lines: { id: string; qty: number; product: { name: string; price: number | null } }[]; total: number }) {
  return (
    <aside className="glass h-fit space-y-3 rounded-2xl p-6">
      {lines.map(({ id, qty, product: p }) => (
        <div key={id} className="flex justify-between text-sm">
          <span>
            {p.name} ×{qty}
          </span>
          <span>{formatINR((p.price ?? 0) * qty)}</span>
        </div>
      ))}
      <div className="flex justify-between border-t border-border pt-3 font-display text-lg">
        <span>Total</span>
        <span>{formatINR(total)}</span>
      </div>
    </aside>
  );
}
