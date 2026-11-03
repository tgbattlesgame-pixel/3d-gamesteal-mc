import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import {
  buildOrderItems,
  genOrderCode,
  isValidProofPath,
  validateEmail,
  validateMcUsername,
  validateOrderCode,
} from "./order-helpers";

/** Anonymous (publishable-key) client — RLS applies; used for public order reads/writes. */
function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  const url = process.env["SUPABASE_URL"];
  if (!url || !key) throw new Error("Server not configured");
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export const createOrder = createServerFn({ method: "POST" })
  .inputValidator(
    (input: { mcUsername: string; email: string; edition: string; items: { id: string; qty: number }[] }) => input,
  )
  .handler(async ({ data }) => {
    const uErr = validateMcUsername(data.mcUsername ?? "");
    if (uErr) return { error: uErr };
    const eErr = validateEmail(data.email ?? "");
    if (eErr) return { error: eErr };
    const edition = data.edition === "bedrock" ? "bedrock" : "java";
    const built = buildOrderItems(data.items ?? []);
    if ("error" in built) return { error: built.error };

    const code = genOrderCode();
    const sb = publicClient();
    const { error } = await sb.from("orders").insert({
      code,
      mc_username: data.mcUsername.trim(),
      email: data.email.trim(),
      edition,
      items: built.items,
      total: built.total,
    });
    if (error) {
      console.error("createOrder failed:", error);
      return { error: "Could not create the order. Please try again." };
    }
    return { code, total: built.total };
  });

export const getOrderByCode = createServerFn({ method: "GET" })
  .inputValidator((input: { code: string }) => input)
  .handler(async ({ data }) => {
    const code = (data.code ?? "").trim().toUpperCase();
    if (!validateOrderCode(code)) return { error: "Enter your order code (looks like GS-AB12CD)." };
    const sb = publicClient();
    const { data: order, error } = await sb
      .from("orders")
      .select("code, mc_username, email, edition, items, total, status, proof_path, created_at")
      .eq("code", code)
      .maybeSingle();
    if (error) {
      console.error("getOrderByCode failed:", error);
      return { error: "Could not load the order." };
    }
    if (!order) return { error: "No order found for that code." };
    const { data: messages, error: mErr } = await sb
      .from("order_messages")
      .select("id, sender, sender_name, body, created_at")
      .eq("order_code", code)
      .order("created_at");
    if (mErr) {
      console.error("getOrderByCode messages failed:", mErr);
      return { error: "Could not load the chat." };
    }
    return {
      order: { ...order, has_proof: !!order.proof_path },
      messages: messages ?? [],
    };
  });

export const postBuyerMessage = createServerFn({ method: "POST" })
  .inputValidator((input: { code: string; body: string }) => input)
  .handler(async ({ data }) => {
    const code = (data.code ?? "").trim().toUpperCase();
    const body = (data.body ?? "").trim();
    if (!validateOrderCode(code)) return { error: "Invalid order code." };
    if (!body || body.length > 1000) return { error: "Message must be 1–1000 characters." };
    const sb = publicClient();
    const { data: order } = await sb.from("orders").select("mc_username").eq("code", code).maybeSingle();
    if (!order) return { error: "No order found for that code." };
    const { error } = await sb.from("order_messages").insert({
      order_code: code,
      sender: "buyer",
      sender_name: order.mc_username,
      body,
    });
    if (error) {
      console.error("postBuyerMessage failed:", error);
      return { error: "Could not send the message. Try again." };
    }
    return { ok: true };
  });

export const submitProof = createServerFn({ method: "POST" })
  .inputValidator((input: { code: string; path: string }) => input)
  .handler(async ({ data }) => {
    const code = (data.code ?? "").trim().toUpperCase();
    if (!validateOrderCode(code)) return { error: "Invalid order code." };
    const path = data.path ?? "";
    if (!isValidProofPath(code, path)) return { error: "Invalid upload." };

    // Proof attachment is a privileged update (anon has no UPDATE grant), so it
    // runs on the admin client after strict path validation.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: order } = await supabaseAdmin.from("orders").select("id, status").eq("code", code).maybeSingle();
    if (!order) return { error: "No order found for that code." };
    if (order.status !== "pending") return { error: "This order has already been processed." };
    const { error } = await supabaseAdmin.from("orders").update({ proof_path: path }).eq("code", code);
    if (error) {
      console.error("submitProof failed:", error);
      return { error: "Could not save the screenshot. Try again." };
    }
    return { ok: true };
  });
