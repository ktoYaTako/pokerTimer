import { useState, useEffect, useCallback } from "react";
import { Tournament } from "../types/tournament";
import * as api from "../api/tournament";

export function useTournament(tournamentId: string) {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTournament = useCallback(async () => {
    try {
      setError(null);
      const data = await api.getTournament(tournamentId);
      setTournament(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [tournamentId]);

  useEffect(() => {
    fetchTournament();
  }, [fetchTournament]);

  return { tournament, loading, error, refetch: fetchTournament };
}

export function useRealtimeTournament(tournamentId: string) {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initial fetch
    api
      .getTournament(tournamentId)
      .then(setTournament)
      .catch((err) => setError(err.message));

    // WebSocket connection
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//localhost:3000/ws/tournaments/${tournamentId}`;
    console.log("[WebSocket] Connecting to:", wsUrl);

    let ws: WebSocket | null = null;

    try {
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("[WebSocket] Connected successfully");
        setConnected(true);
        setError(null);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log("[WebSocket] Message received:", message.type);
          if (message.type === "tournament_update") {
            setTournament(message.data);
          }
        } catch (err) {
          console.error("[WebSocket] Failed to parse message:", err);
        }
      };

      ws.onerror = (event) => {
        console.error("[WebSocket] Error event:", event);
        setError("WebSocket connection failed");
        setConnected(false);
      };

      ws.onclose = (event) => {
        console.log("[WebSocket] Closed with code:", event.code, "reason:", event.reason);
        setConnected(false);
      };
    } catch (err) {
      console.error("[WebSocket] Failed to create WebSocket:", err);
      setError(`WebSocket creation failed: ${err}`);
    }

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [tournamentId]);

  return { tournament, connected, error };
}

export function useTournamentActions(tournamentId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async <T>(action: () => Promise<T>): Promise<T | null> => {
      try {
        setLoading(true);
        setError(null);
        return await action();
      } catch (err) {
        const message = (err as Error).message;
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const start = useCallback(
    () => execute(() => api.startTournament(tournamentId)),
    [execute, tournamentId],
  );
  const pause = useCallback(
    () => execute(() => api.pauseTournament(tournamentId)),
    [execute, tournamentId],
  );
  const resume = useCallback(
    () => execute(() => api.resumeTournament(tournamentId)),
    [execute, tournamentId],
  );
  const reset = useCallback(
    () => execute(() => api.resetTournament(tournamentId)),
    [execute, tournamentId],
  );
  const nextLvl = useCallback(
    () => execute(() => api.nextLevel(tournamentId)),
    [execute, tournamentId],
  );
  const prevLvl = useCallback(
    () => execute(() => api.previousLevel(tournamentId)),
    [execute, tournamentId],
  );

  return { start, pause, resume, reset, nextLvl, prevLvl, loading, error };
}
