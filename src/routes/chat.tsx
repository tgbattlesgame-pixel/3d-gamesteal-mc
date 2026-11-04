import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, MessageSquareText, Send } from "lucide-react";
import { getOrderByCode, postBuyerMessage } from "@/lib/orders.functions";
import { formatINR } from "@/lib/products";
import type { BuiltItem } from "@/lib/order-helpers";
import { btn, SectionTitle } from "@/components/site";

export const Route = createFileRoute("/chat")({
  validateSearch: (s: { code?: string }) => ({
    code: typeof s.code === "string" && s.code.trim() ? s.code.trim().toUpperCase() : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Order chat — GAMERSTEAL Store" },
      { name: "description", content: "Check your order status and chat with the GAMERSTEAL team." },
      { property: "og:title", content: "Order chat — GAMERSTEAL Store" },
      { property: "og:description", content: "Check your order status and chat with the GAMERSTEAL team." },
    ],
  }),
  component: ChatPage,
});

type OrderResult = {
  order: {
    code: string;
    mc_username: string;
    edition: string;
    items: BuiltItem[];
    total: number;
    status: string;
    has_proof: boolean;
    created_at: string;
  };
  messages: { id: string; sender: string; sender_name: string; body: string; created_at: string }[];
};

const STATUS_TEXT: Record<string, string> = {
  pending: "Waiting for payment verification",
  verified: "Payment verified — being prepared",
  delivered: "Delivered in-game. Enjoy!",
  rejected: "Payment could not be verified — chat with us",
};

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-gold/15 text-gold border-gold/40",
  verified: "bg-primary/15 text-primary border-primary/40",
  delivered: "bg-emerald-500/15 text-emerald-400 border-emerald-500/40",
  rejected: "bg-destructive/15 text-destructive border-destructive/40",
};

function ChatPage() {
  const { code } = Route.useSearch();
  return (
    <section className="mx-auto max-w-2xl px-4 py-16">
      <SectionTitle eyebrow="Order support" title="ORDER CHAT" sub="Check your status and talk to the team — no account needed, just your order code." />
      {code ? <OrderThread code={code} /> : <CodeEntry />}
    </section>
  );
}

function CodeEntry() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const c = code.trim().toUpperCase();
        if (!/^GS-[A-HJ-NP-Z2-9]{6}$/.test(c)) return setErr("Order codes look like GS-AB12CD.");
        setErr("");
        navigate({ to: "/chat", search: { code: c } });
      }}
      className="glass space-y-4 rounded-2xl p-6"
      noValidate
    >
      <label className="block text-sm">
        Your order code
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="GS-AB12CD"
          className="mt-1 w-full rounded-lg border border-input bg-background/60 px-4 py-3 text-center font-display text-2xl tracking-widest outline-none focus:border-primary focus:shadow-glow"
          maxLength={9}
        />
      </label>
      {err && (
        <p className="text-sm text-destructive" role="alert">
          {err}
        </p>
      )}
      <button className={`${btn.primary} w-full`}>
        <MessageSquareText className="h-4 w-4" /> Open my order
      </button>
      <p className="text-center text-xs text-muted-foreground">You got your code after checkout — it was also on the payment screen.</p>
    </form>
  );
}

function OrderThread({ code }: { code: string }) {
  const orderFn = useServerFn(getOrderByCode);
  const sendFn = useServerFn(postBuyerMessage);
  const queryClient = useQueryClient();
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [loadErr, setLoadErr] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["buyer-order", code],
    queryFn: () => orderFn({ data: { code } }),
    refetchInterval: 15000,
    retry: false,
  });

  const send = async () => {
    if (!body.trim()) return;
    setSending(true);
    try {
      const res = await sendFn({ data: { code, body } });
      if (res.error) {
        setLoadErr(res.error);
        return;
      }
      setBody("");
      setLoadErr("");
      queryClient.invalidateQueries({ queryKey: ["buyer-order", code] });
    } catch {
      setLoadErr("Message didn't send — please try again.");
    } finally {
      setSending(false);
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  if (!data || "error" in data)
    return (
      <div className="glass rounded-2xl p-6 text-center text-sm text-muted-foreground">
        {data && "error" in data ? data.error : "Could not load the order."}
        <div className="mt-3">
          <button onClick={() => navigateChatReset()} className={`${btn.ghost} !px-3 !py-2 !text-xs`}>
            Try another code
          </button>
        </div>
      </div>
    );

  const { order: o, messages } = data as unknown as OrderResult;

  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl p-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-display text-xl tracking-widest">{o.code}</span>
          <span className={`rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${STATUS_STYLE[o.status] ?? ""}`}>
            {o.status}
          </span>
          {o.has_proof && (
            <span className="rounded-full border border-border bg-background/60 px-3 py-1 text-[11px] uppercase tracking-wider text-muted-foreground">
              Screenshot received
            </span>
          )}
          <span className="ml-auto text-sm text-muted-foreground">{formatINR(o.total)}</span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {STATUS_TEXT[o.status] ?? ""} • {(o.items ?? []).map((i) => `${i.name} ×${i.qty}`).join(", ")}
        </p>
      </div>

      <div className="glass rounded-2xl p-5">
        <div className="mb-3 flex max-h-80 flex-col gap-2 overflow-y-auto">
          {messages.length === 0 && <p className="text-xs text-muted-foreground">No messages yet — say hi or ask about your order!</p>}
          {messages.map((m) => (
            <div key={m.id} className={`rounded-lg px-3 py-2 text-sm ${m.sender === "buyer" ? "ml-8 bg-primary/10" : "mr-8 bg-background/80"}`}>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                {m.sender_name} • {new Date(m.created_at).toLocaleTimeString("en-IN")}
              </p>
              <p className="whitespace-pre-wrap">{m.body}</p>
            </div>
          ))}
        </div>
        {loadErr && (
          <p className="mb-2 text-sm text-destructive" role="alert">
            {loadErr}
          </p>
        )}
        <div className="flex gap-2">
          <input
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
            placeholder="Type a message to the team…"
            className="w-full rounded-lg border border-input bg-background/60 px-4 py-3 text-sm outline-none focus:border-primary focus:shadow-glow"
            maxLength={1000}
          />
          <button onClick={send} disabled={sending || !body.trim()} className={`${btn.primary} !px-4`} aria-label="Send message">
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
        <p className="mt-2 text-center text-xs text-muted-foreground">Updates automatically every 15 seconds.</p>
      </div>
    </div>
  );
}

function navigateChatReset() {
  window.location.href = "/chat";
}
