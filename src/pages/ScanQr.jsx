import { ArrowLeftIcon, ComputerDesktopIcon, QrCodeIcon } from "@heroicons/react/24/outline";
import { QRCodeSVG } from "qrcode.react";
import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { buildJoinUrl, joinRoom } from "../api/lobby";
import { savePlayerSession } from "../lib/playerSession";

export default function ScanQr() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRoomCode = searchParams.get("room")?.toUpperCase() ?? "";
  const [roomCode, setRoomCode] = useState(initialRoomCode);
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const qrValue = useMemo(
    () => buildJoinUrl(roomCode || "ROOMCODE"),
    [roomCode],
  );

  async function handleJoin(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await joinRoom({
        roomCode,
        nickname,
      });

      savePlayerSession({
        roomCode: result.room.roomCode,
        playerId: result.player.id,
        nickname: result.player.nickname,
      });

      navigate(`/game?room=${result.room.roomCode}&playerId=${result.player.id}`);
    } catch (joinError) {
      setError(joinError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 text-slate-950 md:p-8">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-8">
        <header className="flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-indigo-600">
            <ArrowLeftIcon className="h-5 w-5" />
            Retour
          </Link>
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-500 shadow-sm ring-1 ring-slate-200">
            <ComputerDesktopIcon className="h-5 w-5 text-indigo-500" />
            Ecran joueur
          </div>
        </header>

        <div className="grid flex-1 items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70">
            <div className="mb-6 inline-flex rounded-full bg-indigo-100 p-4 shadow-inner">
              <QrCodeIcon className="h-8 w-8 text-indigo-600" />
            </div>

            <h1 className="text-4xl font-black text-slate-950 md:text-5xl">
              Rejoins la partie Qui a la réf ?
            </h1>
            <p className="mt-3 text-lg text-slate-500">
              Saisis le code de salle et ton pseudo. Si tu es deja sur le bon lien,
              le code est pre-rempli automatiquement.
            </p>

            <form onSubmit={handleJoin} className="mt-8 space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Code de salle
                </span>
                <input
                  type="text"
                  value={roomCode}
                  onChange={(event) => setRoomCode(event.target.value.toUpperCase())}
                  placeholder="ABC123"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-2xl font-black tracking-[0.3em] outline-none transition focus:border-indigo-300 focus:bg-white"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Pseudo
                </span>
                <input
                  type="text"
                  value={nickname}
                  onChange={(event) => setNickname(event.target.value)}
                  placeholder="Votre pseudo"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-lg outline-none transition focus:border-indigo-300 focus:bg-white"
                />
              </label>

              {error && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !roomCode || !nickname}
                className="flex w-full items-center justify-center gap-3 rounded-full bg-indigo-600 px-5 py-4 text-lg font-black text-white shadow-lg shadow-indigo-100 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <QrCodeIcon className="h-6 w-6" />
                {loading ? "Connexion..." : "Rejoindre la room"}
              </button>
            </form>
          </section>

          <section className="flex items-center justify-center">
            <div className="relative group">
              <div className="absolute -top-4 -left-4 h-12 w-12 rounded-tl-lg border-t-4 border-l-4 border-indigo-500" />
              <div className="absolute -top-4 -right-4 h-12 w-12 rounded-tr-lg border-t-4 border-r-4 border-indigo-500" />
              <div className="absolute -bottom-4 -left-4 h-12 w-12 rounded-bl-lg border-b-4 border-l-4 border-indigo-500" />
              <div className="absolute -bottom-4 -right-4 h-12 w-12 rounded-br-lg border-r-4 border-b-4 border-indigo-500" />

              <div className="relative rounded-[2rem] border border-slate-200 bg-white p-6 text-center shadow-2xl">
                <QRCodeSVG value={qrValue} size={260} className="mx-auto" />
                <div className="absolute top-0 left-0 h-1 w-full animate-[scan-line_2s_linear_infinite] bg-indigo-500 shadow-lg" />
                <p className="mt-6 text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
                  QR de la room
                </p>
                <p className="mt-2 text-3xl font-black tracking-[0.25em] text-indigo-600">
                  {roomCode || "ROOM"}
                </p>
                <p className="mt-4 text-sm text-slate-500">
                  Le PC affiche ce meme lien pour rejoindre la salle.
                </p>
              </div>
            </div>
          </section>
        </div>

        <style>{`
          @keyframes scan-line {
            0% { top: 0%; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
          }
        `}</style>
      </div>
    </div>
  );
}
