import { useEffect, useMemo, useState } from "react";
import { getRoomState, submitAnswer as submitAnswerRequest } from "../api/lobby";

const POLLING_INTERVAL_MS = Number(import.meta.env.VITE_POLLING_INTERVAL_MS ?? 1000);

export function useRoomState({ roomCode, role = "spectator", playerId = null }) {
  const [state, setState] = useState(null);
  const [error, setError] = useState("");
  const [now, setNow] = useState(0);

  useEffect(() => {
    if (!roomCode) {
      return undefined;
    }

    let cancelled = false;

    async function refreshState() {
      try {
        const result = await getRoomState(roomCode, { role, playerId });

        if (!cancelled) {
          setState(result.state);
          setError("");
        }
      } catch (fetchError) {
        if (!cancelled) {
          setError(fetchError.message);
        }
      }
    }

    refreshState();
    const interval = window.setInterval(refreshState, POLLING_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [playerId, role, roomCode]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 250);

    return () => window.clearInterval(interval);
  }, []);

  const phaseRemainingMs = useMemo(() => {
    const phaseEndsAt = state?.room?.phaseEndsAt;

    if (!phaseEndsAt) {
      return 0;
    }

    return Math.max(phaseEndsAt - now, 0);
  }, [now, state?.room?.phaseEndsAt]);

  const nextEliminationMs = useMemo(() => {
    const nextEliminationAt = state?.room?.nextEliminationAt;

    if (!nextEliminationAt) {
      return 0;
    }

    return Math.max(nextEliminationAt - now, 0);
  }, [now, state?.room?.nextEliminationAt]);

  async function submitAnswer(payload) {
    const result = await submitAnswerRequest(payload);
    const refreshed = await getRoomState(roomCode, { role, playerId });
    setState(refreshed.state);
    setError("");
    return result.result;
  }

  return {
    state,
    loading: Boolean(roomCode) && !state && !error,
    error,
    phaseRemainingMs,
    nextEliminationMs,
    submitAnswer,
  };
}
