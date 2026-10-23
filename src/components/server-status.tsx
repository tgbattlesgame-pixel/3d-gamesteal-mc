import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { getServerStatus, type ServerStatus } from "@/lib/server-status.functions";
import { SERVER } from "@/lib/products";

const REFRESH_MS = 60_000;

export function ServerStatusPanel() {
  const [status, setStatus] = useState<ServerStatus | null>(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const s = await getServerStatus();
        if (alive) setStatus(s);
      } catch {
        if (alive) setStatus({ online: false, players: null, max: null, error: "failed" });
      }
    };
    load();
    const t = setInterval(load, REFRESH_MS);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  const online = status?.online ?? false;
  const label = !status
    ? "Checking status…"
    : status.error
      ? "Status unavailable"
      : status.online
        ? `Online — ${status.players ?? 0} player${status.players === 1 ? "" : "s"} connected`
        : "Server offline";

  return (
    <div className="glass mx-auto flex w-full max-w-md flex-col items-center gap-3 rounded-2xl px-5 py-4 sm:flex-row sm:justify-between">
      <div className="flex items-center gap-3">
        <span
          className={`h-3 w-3 shrink-0 rounded-full ${online ? "bg-success pulse-glow" : status && !status.error ? "bg-destructive" : "bg-muted-foreground"}`}
          aria-hidden
        />
        <div className="text-left">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Live server status</p>
          <p className="font-display text-sm tracking-wider">{SERVER.ip}</p>
          <p className={`text-xs ${status && !status.error ? (online ? "text-success" : "text-muted-foreground") : "text-muted-foreground"}`} role="status">
            {label}
          </p>
        </div>
      </div>
      {online && (
        <span className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold">
          <Users className="h-3.5 w-3.5 text-primary" />
          {status?.players ?? 0}
          {status?.max ? ` / ${status.max}` : ""}
        </span>
      )}
    </div>
  );
}
