import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { btn, SectionTitle } from "@/components/site";
import logo from "@/assets/gamersteal-logo.png";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: { redirect?: string }) => ({
    redirect:
      typeof s.redirect === "string" && s.redirect.startsWith("/") && !s.redirect.startsWith("//")
        ? s.redirect
        : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Staff sign in — GAMERSTEAL Store" },
      { name: "description", content: "Sign in to manage GAMERSTEAL orders and chat." },
      { property: "og:title", content: "Staff sign in — GAMERSTEAL Store" },
      { property: "og:description", content: "Sign in to manage GAMERSTEAL orders and chat." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [err, setErr] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setNotice("");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setErr("Enter a valid email address.");
    if (password.length < 6) return setErr("Password must be at least 6 characters.");
    setBusy(true);
    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) return setErr(error.message);
      toast.success("Signed in!");
      navigate({ to: redirect || "/admin" });
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      setBusy(false);
      if (error) return setErr(error.message);
      if (data.session) {
        toast.success("Account created!");
        navigate({ to: redirect || "/admin" });
      } else {
        setNotice("Account created! Check your email and click the confirmation link, then sign in.");
      }
    }
  };

  const input =
    "w-full rounded-lg border border-input bg-background/60 px-4 py-3 outline-none focus:border-primary focus:shadow-glow";

  return (
    <section className="mx-auto max-w-md px-4 py-16">
      <SectionTitle eyebrow="Staff area" title="SIGN IN" sub="For the GAMERSTEAL team — manage orders, chat and admins." />
      <div className="glass space-y-4 rounded-2xl p-6">
        <div className="flex justify-center">
          <img src={logo} alt="GAMERSTEAL MC" className="h-14 w-auto" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          {(["signin", "signup"] as const).map((m) => (
            <button
              type="button"
              key={m}
              onClick={() => {
                setMode(m);
                setErr("");
                setNotice("");
              }}
              className={`rounded-lg border px-4 py-2.5 text-sm font-bold uppercase ${
                mode === m ? "border-primary bg-primary/20 shadow-glow" : "border-input"
              }`}
            >
              {m === "signin" ? "Sign in" : "Create account"}
            </button>
          ))}
        </div>
        <form onSubmit={submit} className="space-y-4" noValidate>
          <label className="block text-sm">
            Email
            <input type="email" className={`${input} mt-1`} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
          </label>
          <label className="block text-sm">
            Password
            <input type="password" className={`${input} mt-1`} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete={mode === "signin" ? "current-password" : "new-password"} />
          </label>
          {err && (
            <p className="text-sm text-destructive" role="alert">
              {err}
            </p>
          )}
          {notice && (
            <p className="rounded-xl border border-gold/50 bg-gold/10 p-3 text-sm text-gold" role="status">
              {notice}
            </p>
          )}
          <button disabled={busy} className={`${btn.primary} w-full`}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>
        <p className="text-center text-xs text-muted-foreground">Players don't need an account to buy — this is for staff only.</p>
      </div>
    </section>
  );
}
