import { ArrowPathIcon, PlayIcon } from "@heroicons/react/24/outline";
import { QRCodeSVG } from "qrcode.react";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { buildJoinUrl, createRoom, startRoom } from "../api/lobby";
import Leaderboard from "../components/Leaderboard";
import { useRoomState } from "../hooks/useRoomState";

function formatSeconds(milliseconds) {
  return Math.ceil(Math.max(milliseconds, 0) / 1000);
}

function PhasePill({ phase }) {
  const labels = {
    waiting: "Lobby",
    question_live: "Question",
    answer_reveal: "Correction",
    finished: "Termine",
  };

  return (
    <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-cyan-200">
      {labels[phase] ?? phase}
    </span>
  );
}

export default function MainScreen() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [creating, setCreating] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");
  const roomCode = searchParams.get("room")?.toUpperCase() ?? "";
  const { state, loading, error: roomError, phaseRemainingMs, nextEliminationMs } =
    useRoomState({
      roomCode,
      role: "screen",
    });

  const joinUrl = useMemo(
    () => (roomCode ? buildJoinUrl(roomCode) : ""),
    [roomCode],
  );

  async function handleCreateRoom() {
    setCreating(true);
    setError("");

    try {
      const result = await createRoom({
        hostName: "Host Qui a la réf ?",
        themeId: 1,
        maxPlayers: 8,
      });

      setSearchParams({ room: result.room.roomCode });
    } catch (createError) {
      setError(createError.message);
    } finally {
      setCreating(false);
    }
  }

  async function handleStartRoom() {
    if (!roomCode) {
      return;
    }

    setStarting(true);
    setError("");

    try {
      await startRoom(roomCode);
    } catch (startError) {
      setError(startError.message);
    } finally {
      setStarting(false);
    }
  }

  const displayedError = error || roomError;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#15304a,_#050816_55%)] text-white">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-4 py-6 lg:px-8">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-[2rem] border border-white/10 bg-slate-950/50 px-6 py-5 backdrop-blur">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.4em] text-cyan-300/75">
              Qui a la réf ?
            </p>
            <h1 className="text-4xl font-black tracking-tight">Ecran principal</h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {state?.room?.phase && <PhasePill phase={state.room.phase} />}

            {!roomCode && (
              <button
                type="button"
                onClick={handleCreateRoom}
                disabled={creating}
                className="rounded-full bg-cyan-400 px-6 py-3 font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {creating ? "Creation..." : "Creer une room"}
              </button>
            )}

            {roomCode && state?.room?.phase === "waiting" && (
              <button
                type="button"
                onClick={handleStartRoom}
                disabled={starting || loading}
                className="inline-flex items-center gap-2 rounded-full bg-lime-400 px-6 py-3 font-bold text-slate-950 transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <PlayIcon className="h-5 w-5" />
                {starting ? "Lancement..." : "Lancer la partie"}
              </button>
            )}

            {roomCode && (
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 font-semibold transition hover:bg-white/10"
              >
                <ArrowPathIcon className="h-5 w-5" />
                Rafraichir
              </button>
            )}
          </div>
        </header>

        {displayedError && (
          <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-5 py-4 text-red-100">
            {displayedError}
          </div>
        )}

        {!roomCode ? (
          <div className="grid flex-1 place-items-center rounded-[2rem] border border-dashed border-white/15 bg-slate-950/30 p-10 text-center">
            <div className="max-w-2xl space-y-4">
              <h2 className="text-5xl font-black">Pret a ouvrir une battle royale du quiz</h2>
              <p className="text-lg text-slate-300">
                Creez une room puis laissez les joueurs rejoindre depuis leur telephone
                avec le QR code ou le code de salle.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid flex-1 gap-6 lg:grid-cols-[1.6fr_0.9fr]">
            <section className="rounded-[2rem] border border-white/10 bg-slate-950/55 p-6 shadow-2xl shadow-black/30 backdrop-blur">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300/70">
                    Room
                  </p>
                  <h2 className="text-5xl font-black tracking-[0.15em]">{roomCode}</h2>
                </div>
                <div className="grid gap-2 text-right">
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
                    Joueurs
                  </p>
                  <p className="text-3xl font-black">
                    {state?.meta?.alivePlayers ?? 0}/{state?.room?.maxPlayers ?? 8}
                  </p>
                </div>
              </div>

              <div className="mb-6 grid gap-4 md:grid-cols-[220px_1fr]">
                <div className="rounded-[1.5rem] border border-white/10 bg-white p-4 text-center text-slate-950">
                  {joinUrl ? (
                    <>
                      <QRCodeSVG value={joinUrl} size={180} className="mx-auto" />
                      <p className="mt-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Scan pour rejoindre
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-slate-500">QR code indisponible</p>
                  )}
                </div>

                <div className="grid gap-4">
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
                      Timer question
                    </p>
                    <p className="mt-2 text-6xl font-black text-cyan-200">
                      {formatSeconds(phaseRemainingMs)}s
                    </p>
                  </div>
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
                      Prochaine elimination
                    </p>
                    <p className="mt-2 text-4xl font-black text-rose-200">
                      {state?.room?.status === "in_progress" ? `${formatSeconds(nextEliminationMs)}s` : "--"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(145deg,_rgba(14,23,39,0.9),_rgba(8,14,28,0.75))] p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                  Question en cours
                </p>
                <h3 className="mt-3 text-3xl font-black">
                  {state?.question?.title ?? "En attente du lancement"}
                </h3>
                <p className="mt-4 text-xl text-slate-200">
                  {state?.question?.text ?? "Les joueurs peuvent rejoindre la salle."}
                </p>

                {state?.question?.mediaPath && (
                  <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                    Media: {state.question.mediaPath}
                  </div>
                )}

                {state?.question?.choices?.length > 0 && (
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    {state.question.choices.map((choice) => (
                      <div
                        key={choice.id}
                        className={`rounded-[1.4rem] border px-5 py-4 ${
                          choice.isCorrect
                            ? "border-lime-300/40 bg-lime-400/15"
                            : "border-white/10 bg-white/5"
                        }`}
                      >
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                          {choice.label}
                        </p>
                        <p className="mt-2 text-lg font-bold">{choice.text}</p>
                      </div>
                    ))}
                  </div>
                )}

                {state?.reveal && (
                  <div className="mt-6 rounded-[1.5rem] border border-lime-300/30 bg-lime-400/10 p-5">
                    <p className="text-sm uppercase tracking-[0.3em] text-lime-200">
                      Bonne reponse
                    </p>
                    <p className="mt-2 text-2xl font-black">
                      {state.reveal.correctChoiceLabel} · {state.reveal.correctChoiceText}
                    </p>
                    {state.reveal.explanation && (
                      <p className="mt-2 text-slate-200">{state.reveal.explanation}</p>
                    )}
                  </div>
                )}

                {state?.lastElimination && (
                  <div className="mt-6 rounded-[1.5rem] border border-rose-300/30 bg-rose-400/10 p-5">
                    <p className="text-sm uppercase tracking-[0.3em] text-rose-200">
                      Derniere elimination
                    </p>
                    <p className="mt-2 text-2xl font-black">{state.lastElimination.nickname}</p>
                  </div>
                )}
              </div>
            </section>

            <Leaderboard players={state?.leaderboard ?? []} />
          </div>
        )}
      </div>
    </div>
  );
}
