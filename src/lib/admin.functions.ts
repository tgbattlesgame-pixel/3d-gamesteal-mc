import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { isValidOrderStatus } from "./order-helpers";

type AdminContext = { supabase: NonNullable<unknown>; userId: string };

async function requireAdmin(context: AdminContext) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error) {
    console.error("has_role failed:", error);
    throw new Error("Could not verify admin access");
  }
  if (!data) throw new Error("Forbidden: admins only");
}

export const getMyRole = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    return { isAdmin: !!data };
  });

export const listOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const { data, error } = await context.supabase
      .from("orders")
      .select("code, mc_username, email, edition, items, total, status, proof_path, created_at")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("listOrders failed:", error);
      return { error: "Could not load orders." };
    }
    return { orders: data ?? [] };
  });

export const setOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { code: string; status: string }) => input)
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    if (!isValidOrderStatus(data.status)) return { error: "Invalid status." };
    const { error } = await context.supabase.from("orders").update({ status: data.status }).eq("code", data.code);
    if (error) {
      console.error("setOrderStatus failed:", error);
      return { error: "Could not update the order." };
    }
    return { ok: true };
  });

export const getProofUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { path: string }) => input)
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    if (!data.path || !data.path.startsWith("proofs/")) return { error: "No proof uploaded." };
    const { data: url, error } = await context.supabase.storage
      .from("payment-proofs")
      .createSignedUrl(data.path, 600);
    if (error || !url) {
      console.error("getProofUrl failed:", error);
      return { error: "Could not open the screenshot." };
    }
    return { url: url.signedUrl };
  });

export const getOrderThread = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { code: string }) => input)
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { data: messages, error } = await context.supabase
      .from("order_messages")
      .select("id, order_code, sender, sender_name, body, created_at")
      .eq("order_code", data.code)
      .order("created_at");
    if (error) {
      console.error("getOrderThread failed:", error);
      return { error: "Could not load the chat." };
    }
    return { messages: messages ?? [] };
  });

export const postAdminMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { code: string; body: string }) => input)
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const body = (data.body ?? "").trim();
    if (!body || body.length > 1000) return { error: "Message must be 1–1000 characters." };
    const { error } = await context.supabase.from("order_messages").insert({
      order_code: data.code,
      sender: "admin",
      sender_name: "GAMERSTEAL Team",
      body,
    });
    if (error) {
      console.error("postAdminMessage failed:", error);
      return { error: "Could not send the reply." };
    }
    return { ok: true };
  });

async function adminClient() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export const listAdmins = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const admin = await adminClient();
    const { data: roles, error } = await admin
      .from("user_roles")
      .select("user_id, created_at")
      .eq("role", "admin");
    if (error) {
      console.error("listAdmins failed:", error);
      return { error: "Could not load admins." };
    }
    const { data: users, error: uErr } = await admin.auth.admin.listUsers({ perPage: 500 });
    if (uErr) {
      console.error("listAdmins users failed:", uErr);
      return { error: "Could not load accounts." };
    }
    const emailById = new Map(users.users.map((u) => [u.id, u.email ?? "(no email)"]));
    return {
      admins: (roles ?? []).map((r) => ({
        userId: r.user_id,
        email: emailById.get(r.user_id) ?? "(unknown account)",
        createdAt: r.created_at,
      })),
    };
  });

export const grantAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { email: string }) => input)
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const email = (data.email ?? "").trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(email)) return { error: "Enter a valid email address." };
    const admin = await adminClient();
    const { data: users, error: uErr } = await admin.auth.admin.listUsers({ perPage: 500 });
    if (uErr) return { error: "Could not look up accounts." };
    const user = users.users.find((u) => (u.email ?? "").toLowerCase() === email);
    if (!user) return { error: "No account found with that email. They must sign up on the site first." };
    const { error } = await admin.from("user_roles").upsert(
      { user_id: user.id, role: "admin" },
      { onConflict: "user_id,role" },
    );
    if (error) {
      console.error("grantAdmin failed:", error);
      return { error: "Could not grant admin." };
    }
    return { ok: true };
  });

export const revokeAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { userId: string }) => input)
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const admin = await adminClient();
    const { count } = await admin.from("user_roles").select("user_id", { count: "exact", head: true }).eq("role", "admin");
    if ((count ?? 0) <= 1) return { error: "You need at least one admin. Grant admin to someone else first." };
    const { error } = await admin.from("user_roles").delete().eq("user_id", data.userId).eq("role", "admin");
    if (error) {
      console.error("revokeAdmin failed:", error);
      return { error: "Could not revoke admin." };
    }
    return { ok: true };
  });
