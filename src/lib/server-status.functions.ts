import { createServerFn } from "@tanstack/react-start";
import { SERVER } from "./products";

export type ServerStatus = {
  online: boolean;
  players: number | null;
  max: number | null;
  error: string | null;
};

export const getServerStatus = createServerFn({ method: "GET" }).handler(
  async (): Promise<ServerStatus> => {
    try {
      const res = await fetch(`https://api.mcsrvstat.us/3/${SERVER.ip.toLowerCase()}`, {
        headers: { accept: "application/json" },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) return { online: false, players: null, max: null, error: `status ${res.status}` };
      const data = await res.json();
      return {
        online: Boolean(data.online),
        players: data.players?.online ?? null,
        max: data.players?.max ?? null,
        error: null,
      };
    } catch (e) {
      return { online: false, players: null, max: null, error: e instanceof Error ? e.message : "fetch failed" };
    }
  },
);
