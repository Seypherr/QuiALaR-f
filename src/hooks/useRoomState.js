import { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { getRoomState, SOCKET_URL } from "../api/lobby";

export function useRoomState({ roomCode, role = "spectator", playerId = null }) {
  const socketRef = useRef(null);
  const [state, setState] = useState(null);
  const [error, setError] = useState("");
  const [now, setNow] = useState(0);

  useEffect(() => {
    if (!roomCode) {
      return undefined;
    }

    let cancelled = false;

    async function bootstrap() {
      setError("");

      try {
        const result = await getRoomState(roomCode, { role, playerId });

        if (!cancelled) {
          setState(result.state);
        }
      } catch (fetchError) {
        if (!cancelled) {
          setError(fetchError.message);
        }
      }
    }

    bootstrap();

    const socket = SOCKET_URL
      ? io(SOCKET_URL, {
          transports: ["websocket"],
        })
      : io({
          transports: ["websocket"],
        });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("room:watch", { roomCode, role, playerId }, (ack) => {
        if (!ack?.ok && !cancelled) {
          setError(ack?.error ?? "Impossible de se connecter a la room.");
        }
      });
    });

    socket.on("room:state", (nextState) => {
      if (!cancelled) {
        setState(nextState);
        setError("");
      }
    });

    socket.on("connect_error", (socketError) => {
      if (!cancelled) {
        setError(socketError.message);
      }
    });

    return () => {
      cancelled = true;
      socket.disconnect();
      socketRef.current = null;
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
    const socket = socketRef.current;

    if (!socket) {
      throw new Error("Connexion temps reel indisponible.");
    }

    return new Promise((resolve, reject) => {
      socket.emit("answer:submit", payload, (ack) => {
        if (!ack?.ok) {
          reject(new Error(ack?.error ?? "Reponse refusee."));
          return;
        }

        resolve(ack.result);
      });
    });
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
