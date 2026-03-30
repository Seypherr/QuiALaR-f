import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useRoomState } from "../hooks/useRoomState";
import { clearPlayerSession, getPlayerSession } from "../lib/playerSession";
import Leaderboard from "./Leaderboard";
import MediaQuestion from "./questions/MediaQuestion";
import QCM from "./questions/QCM";

function formatSeconds(milliseconds) {
  return Math.ceil(Math.max(milliseconds, 0) / 1000);
}

export default function Game() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const session = useMemo(() => getPlayerSession(), []);
  const roomCode = searchParams.get("room")?.toUpperCase() ?? session?.roomCode ?? "";
  const playerId = Number(searchParams.get("playerId") ?? session?.playerId ?? 0) || null;
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { state, loading, error, phaseRemainingMs, nextEliminationMs, submitAnswer } =
    useRoomState({
      roomCode,
      role: "player",
      playerId,
    });

  async function handleChoice(choiceId) {
    if (!roomCode || !playerId || state?.viewer?.hasAnswered || submitting) {
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      await submitAnswer({
        roomCode,
        playerId,
        choiceId,
      });
    } catch (answerError) {
      setSubmitError(answerError.message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleLeave() {
    clearPlayerSession();
    navigate("/scan");
  }

  const question = state?.question;
  const questionData = {
    question: question?.text,
    mediaUrl: question?.mediaPath,
    mediaPath: question?.mediaPath,
    options: question?.choices ?? [],
  };
  const isLobby = state?.room?.phase === "waiting";
  const isLive = state?.room?.phase === "question_live";
  const isReveal = state?.room?.phase === "answer_reveal";
  const isFinished = state?.room?.phase === "finished";
  const isEliminated = state?.viewer?.status === "eliminated";
  const isWinner = state?.viewer?.status === "winner";

  if (!roomCode || !playerId) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-950 px-4 text-center text-white">
        <div className="space-y-4">
          <h1 className="text-4xl font-black">Aucune session joueur detectee</h1>
          <button
            type="button"
            onClick={() => navigate("/scan")}
            className="rounded-full bg-indigo-600 px-6 py-3 font-bold text-white"
          >
            Rejoindre une room
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.18),_transparent_35%),linear-gradient(180deg,_#312e81_0%,_#1e1b4b_42%,_#0f172a_100%)] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-5 px-4 py-5">
        <header className="flex items-center justify-between rounded-[2rem] border border-white/10 bg-black/20 px-5 py-4 backdrop-blur">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-indigo-200/70">
              Room {roomCode}
            </p>
            <h1 className="text-3xl font-black">{state?.viewer?.nickname ?? "Joueur"}</h1>
          </div>

          <button
            type="button"
            onClick={handleLeave}
            className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold transition hover:bg-white/10"
          >
            Quitter
          </button>
        </header>

        {(error || submitError) && (
          <div className="rounded-2xl border border-rose-300/30 bg-rose-500/15 px-4 py-3 text-rose-100">
            {submitError || error}
          </div>
        )}

        <div className="grid flex-1 gap-4 lg:grid-cols-[1.35fr_0.78fr]">
          <section className="rounded-[2rem] border border-white/10 bg-black/20 p-5 shadow-2xl shadow-black/30 backdrop-blur">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-indigo-200/60">Votre score</p>
                <p className="text-5xl font-black text-yellow-300">{state?.viewer?.score ?? 0}</p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-[0.3em] text-indigo-200/60">Timer</p>
                <p className="text-5xl font-black">{formatSeconds(phaseRemainingMs)}s</p>
              </div>
            </div>

            <div className="mb-5 rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.3em] text-indigo-100/50">
                Prochaine elimination
              </p>
              <p className="mt-1 text-2xl font-black text-rose-200">
                {state?.room?.status === "in_progress" ? `${formatSeconds(nextEliminationMs)}s` : "--"}
              </p>
            </div>

            {loading ? (
              <div className="grid h-[420px] place-items-center rounded-[1.8rem] border border-white/10 bg-white/5">
                <div className="flex items-center gap-3 text-lg font-semibold text-slate-200">
                  <ArrowPathIcon className="h-6 w-6 animate-spin" />
                  Connexion a la partie...
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="rounded-[1.8rem] border border-white/10 bg-[linear-gradient(145deg,_rgba(49,46,129,0.72),_rgba(15,23,42,0.82))] p-6">
                  <p className="text-xs uppercase tracking-[0.3em] text-indigo-100/55">
                    {isLobby
                      ? "Lobby"
                      : isReveal
                        ? "Correction"
                        : isFinished
                          ? "Fin de partie"
                          : "Question"}
                  </p>

                  <h2 className="mt-3 text-3xl font-black">
                    {isLobby
                      ? "En attente du lancement de la partie"
                      : question?.title ?? "Question en cours"}
                  </h2>

                  <p className="mt-4 text-lg text-slate-100">
                    {isLobby
                      ? "Gardez votre telephone pret. L ecran principal va lancer la premiere question."
                      : question?.text}
                  </p>
                </div>

                {isEliminated && (
                  <div className="rounded-[1.6rem] border border-rose-300/30 bg-rose-500/10 p-5 text-center">
                    <p className="text-sm uppercase tracking-[0.3em] text-rose-200">Elimine</p>
                    <p className="mt-3 text-3xl font-black">Vous restez spectateur de la partie</p>
                  </div>
                )}

                {isWinner && (
                  <div className="rounded-[1.6rem] border border-yellow-300/30 bg-yellow-400/10 p-5 text-center">
                    <p className="text-sm uppercase tracking-[0.3em] text-yellow-200">Victoire</p>
                    <p className="mt-3 text-3xl font-black">Dernier joueur vivant</p>
                  </div>
                )}

                {isLive && !isEliminated && question?.choices?.length > 0 && (
                  question?.mediaPath ? (
                    <MediaQuestion
                      data={questionData}
                      disabled={state?.viewer?.hasAnswered || submitting}
                      onAnswer={handleChoice}
                    />
                  ) : (
                    <QCM
                      data={questionData}
                      disabled={state?.viewer?.hasAnswered || submitting}
                      onAnswer={handleChoice}
                    />
                  )
                )}

                {isLive && state?.viewer?.hasAnswered && (
                  <div className="rounded-[1.5rem] border border-green-300/30 bg-green-400/15 p-5 text-center">
                    <p className="text-sm uppercase tracking-[0.3em] text-green-100">
                      Reponse envoyee
                    </p>
                    <p className="mt-2 text-2xl font-black">
                      Attendez la correction sur l ecran principal
                    </p>
                  </div>
                )}

                {isReveal && state?.reveal && (
                  <div className="rounded-[1.5rem] border border-lime-300/30 bg-lime-400/10 p-5">
                    <p className="text-sm uppercase tracking-[0.3em] text-lime-200">
                      Bonne reponse
                    </p>
                    <p className="mt-2 text-2xl font-black">
                      {state.reveal.correctChoiceLabel} - {state.reveal.correctChoiceText}
                    </p>
                    {state.reveal.explanation && (
                      <p className="mt-2 text-slate-100">{state.reveal.explanation}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </section>

          <Leaderboard players={state?.leaderboard ?? []} compact />
        </div>
      </div>
    </div>
  );
}
