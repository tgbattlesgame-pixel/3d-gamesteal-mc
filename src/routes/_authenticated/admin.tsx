import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Eye, Loader2, LogOut, ShieldAlert, Trash2, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  getMyRole,
  getOrderThread,
  getProofUrl,
  grantAdmin,
  listAdmins,
  listOrders,
  postAdminMessage,
  revokeAdmin,
  setOrderStatus,
} from "@/lib/admin.functions";
import { formatINR } from "@/lib/products";
import type { BuiltItem } from "@/lib/order-helpers";
import { btn, SectionTitle } from "@/components/site";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin panel — GAMERSTEAL Store" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

type AdminOrder = {
  code: string;
  mc_username: string;
  email: string;
  edition: string;
  items: BuiltItem[];
  total: number;
  status: string;
  proof_path: string | null;
  created_at: string;
};

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-gold/15 text-gold border-gold/40",
  verified: "bg-primary/15 text-primary border-primary/40",
  delivered: "bg-emerald-500/15 text-emerald-400 border-emerald-500/40",
  rejected: "bg-destructive/15 text-destructive border-destructive/40",
};

function AdminPage() {
  const roleFn = useServerFn(getMyRole);
  const { data: role, isLoading } = useQuery({ queryKey: ["my-role"], queryFn: () => roleFn() });

  if (isLoading)
    return (
      <div className="flex justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  if (role && "error" in role) return <NoticeBox message={String(role.error)} />;
  if (role && !role.isAdmin)
    return (
      <NoticeBox
        icon={<ShieldAlert className="h-10 w-10 text-gold" />}
        message="You're signed in, but this account doesn't have the admin title yet. Ask an existing admin to grant it on the Admins tab."
      />
    );

  return <AdminDashboard />;
}

function NoticeBox({ message, icon }: { message: string; icon?: React.ReactNode }) {
  return (
    <div className="glass mx-auto max-w-md space-y-3 rounded-2xl p-8 text-center">
      {icon ?? <ShieldAlert className="mx-auto h-10 w-10 text-gold" />}
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

function AdminDashboard() {
  const [tab, setTab] = useState<"orders" | "admins">("orders");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true, search: {} });
  };

  return (
    <section className="mx-auto max-w-5xl px-4 py-12">
      <div className="flex items-end justify-between gap-4">
        <SectionTitle eyebrow="Staff only" title="ADMIN PANEL" sub="Verify payments, chat with buyers and manage admin titles." />
        <button onClick={signOut} className={`${btn.ghost} shrink-0 !px-3 !py-2 !text-xs`}>
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>

      <div className="mb-8 flex gap-2">
        {(["orders", "admins"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg border px-5 py-2.5 text-sm font-bold uppercase tracking-wider ${
              tab === t ? "border-primary bg-primary/20 shadow-glow" : "border-input"
            }`}
          >
            {t === "orders" ? "Orders" : "Admins"}
          </button>
        ))}
      </div>

      {tab === "orders" ? <OrdersTab /> : <AdminsTab />}
    </section>
  );
}

function OrdersTab() {
  const ordersFn = useServerFn(listOrders);
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: () => ordersFn(),
    refetchInterval: 20000,
  });

  if (isLoading)
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  if (!data) return null;
  if ("error" in data) return <NoticeBox message={data.error} />;

  const orders = data.orders as AdminOrder[];
  if (orders.length === 0)
    return <p className="glass rounded-2xl p-8 text-center text-sm text-muted-foreground">No orders yet. They'll appear here the moment a player checks out.</p>;

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">Auto-refreshes every 20 seconds.</p>
      {orders.map((o) => (
        <OrderCard key={o.code} order={o} onChanged={refetch} />
      ))}
    </div>
  );
}

function OrderCard({ order: o, onChanged }: { order: AdminOrder; onChanged: () => void }) {
  const statusFn = useServerFn(setOrderStatus);
  const proofFn = useServerFn(getProofUrl);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);

  const updateStatus = async (status: string) => {
    setBusy(true);
    const res = await statusFn({ data: { code: o.code, status } });
    setBusy(false);
    if (res.error) { toast.error(res.error); return; }
    toast.success(`Order ${o.code} marked ${status}.`);
    onChanged();
  };

  const viewProof = async () => {
    if (!o.proof_path) return;
    const res = await proofFn({ data: { path: o.proof_path } });
    if (res.error) { toast.error(res.error); return; }
    window.open(res.url, "_blank", "noopener");
  };

  return (
    <article className="glass rounded-2xl p-5">
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-display text-lg tracking-widest">{o.code}</span>
        <span className={`rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${STATUS_STYLE[o.status] ?? ""}`}>
          {o.status}
        </span>
        {o.proof_path && (
          <span className="rounded-full border border-border bg-background/60 px-3 py-1 text-[11px] uppercase tracking-wider text-muted-foreground">
            Screenshot uploaded
          </span>
        )}
        <span className="ml-auto text-sm text-muted-foreground">{new Date(o.created_at).toLocaleString("en-IN")}</span>
      </div>

      <div className="mt-3 grid gap-1 text-sm text-muted-foreground sm:grid-cols-2">
        <p>
          <span className="font-semibold text-foreground">{o.mc_username}</span> ({o.edition}) • {o.email}
        </p>
        <p className="sm:text-right">
          {formatINR(o.total)} • {(o.items ?? []).map((i) => `${i.name} ×${i.qty}`).join(", ")}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={viewProof} disabled={!o.proof_path} className={`${btn.ghost} !px-3 !py-2 !text-xs`}>
          <Eye className="h-4 w-4" /> View proof
        </button>
        <button onClick={() => updateStatus("verified")} disabled={busy || o.status !== "pending"} className={`${btn.ghost} !px-3 !py-2 !text-xs`}>
          <CheckCircle2 className="h-4 w-4" /> Mark paid
        </button>
        <button onClick={() => updateStatus("delivered")} disabled={busy || o.status === "delivered"} className={`${btn.primary} !px-3 !py-2 !text-xs`}>
          Mark delivered
        </button>
        <button onClick={() => updateStatus("rejected")} disabled={busy || o.status === "rejected"} className={`${btn.ghost} !px-3 !py-2 !text-xs !text-destructive`}>
          Reject
        </button>
        <button onClick={() => setOpen(!open)} className={`${btn.ghost} ml-auto !px-3 !py-2 !text-xs`}>
          {open ? "Hide chat" : "Open chat"}
        </button>
      </div>

      {open && <OrderChat code={o.code} />}
    </article>
  );
}

function OrderChat({ code }: { code: string }) {
  const threadFn = useServerFn(getOrderThread);
  const sendFn = useServerFn(postAdminMessage);
  const queryClient = useQueryClient();
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-thread", code],
    queryFn: () => threadFn({ data: { code } }),
    refetchInterval: 10000,
  });

  const send = async () => {
    if (!body.trim()) return;
    setSending(true);
    const res = await sendFn({ data: { code, body } });
    setSending(false);
    if (res.error) { toast.error(res.error); return; }
    setBody("");
    queryClient.invalidateQueries({ queryKey: ["admin-thread", code] });
  };

  const messages = data && !("error" in data) ? data.messages : [];

  return (
    <div className="mt-4 rounded-xl border border-border bg-background/40 p-4">
      <div className="mb-3 max-h-64 space-y-2 overflow-y-auto">
        {isLoading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
        {messages.length === 0 && !isLoading && <p className="text-xs text-muted-foreground">No messages yet.</p>}
        {messages.map((m) => (
          <div key={m.id} className={`rounded-lg px-3 py-2 text-sm ${m.sender === "admin" ? "ml-8 bg-primary/10" : "mr-8 bg-background/80"}`}>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              {m.sender_name} • {new Date(m.created_at).toLocaleTimeString("en-IN")}
            </p>
            <p className="whitespace-pre-wrap">{m.body}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
          placeholder="Reply as GAMERSTEAL Team…"
          className="w-full rounded-lg border border-input bg-background/60 px-4 py-2.5 text-sm outline-none focus:border-primary"
          maxLength={1000}
        />
        <button onClick={send} disabled={sending || !body.trim()} className={`${btn.primary} !px-4 !py-2.5 !text-xs`}>
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send"}
        </button>
      </div>
    </div>
  );
}

type AdminRow = { userId: string; email: string; createdAt: string };

function AdminsTab() {
  const listFn = useServerFn(listAdmins);
  const grantFn = useServerFn(grantAdmin);
  const revokeFn = useServerFn(revokeAdmin);
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const { data, isLoading } = useQuery({ queryKey: ["admin-roles"], queryFn: () => listFn() });

  const grant = async () => {
    setBusy(true);
    const res = await grantFn({ data: { email } });
    setBusy(false);
    if (res.error) { toast.error(res.error); return; }
    toast.success("Admin title granted.");
    setEmail("");
    queryClient.invalidateQueries({ queryKey: ["admin-roles"] });
  };

  const revoke = async (userId: string) => {
    const res = await revokeFn({ data: { userId } });
    if (res.error) { toast.error(res.error); return; }
    toast.success("Admin title removed.");
    queryClient.invalidateQueries({ queryKey: ["admin-roles"] });
  };

  if (isLoading)
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  if (!data) return null;
  if ("error" in data) return <NoticeBox message={data.error} />;

  const admins = data.admins as AdminRow[];

  return (
    <div className="space-y-4">
      <div className="glass flex flex-col gap-2 rounded-2xl p-5 sm:flex-row">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Account email to make admin (must have signed up)"
          className="w-full rounded-lg border border-input bg-background/60 px-4 py-3 text-sm outline-none focus:border-primary"
          type="email"
        />
        <button onClick={grant} disabled={busy || !email.trim()} className={`${btn.primary} shrink-0 !text-xs`}>
          <UserPlus className="h-4 w-4" /> Grant admin
        </button>
      </div>
      <div className="glass divide-y divide-border rounded-2xl">
        {admins.length === 0 && (
          <p className="p-6 text-center text-sm text-muted-foreground">
            <Users className="mx-auto mb-2 h-6 w-6" />
            No admins yet.
          </p>
        )}
        {admins.map((a) => (
          <div key={a.userId} className="flex items-center gap-3 p-4">
            <div>
              <p className="font-semibold">{a.email}</p>
              <p className="text-xs text-muted-foreground">Admin since {new Date(a.createdAt).toLocaleDateString("en-IN")}</p>
            </div>
            <button onClick={() => revoke(a.userId)} className={`${btn.ghost} ml-auto !px-3 !py-2 !text-xs !text-destructive`}>
              <Trash2 className="h-4 w-4" /> Remove
            </button>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        New sign-ups need to create an account at the staff sign-in page first — then enter their email here.
      </p>
    </div>
  );
}
