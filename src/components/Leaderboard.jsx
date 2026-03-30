import { TrophyIcon, UserCircleIcon } from "@heroicons/react/24/solid";

function cardClasses(status) {
  if (status === "winner") {
    return "border-yellow-300/50 bg-yellow-400/15 text-yellow-50";
  }

  if (status === "eliminated") {
    return "border-white/10 bg-white/5 text-white/45";
  }

  return "border-white/10 bg-white/6 text-white";
}

export default function Leaderboard({ players = [], compact = false }) {
  const podium = players.slice(0, 3);
  const others = players.slice(3);

  return (
    <section className="overflow-hidden rounded-[2rem] bg-indigo-950 p-6 text-white shadow-2xl">
      <div className="mb-10 flex items-center gap-4">
        <div className="relative">
          <TrophyIcon className="h-14 w-14 text-yellow-400" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex h-4 w-4 rounded-full bg-red-500" />
          </span>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-200/70">
            Direct
          </p>
          <h2 className="text-4xl font-black tracking-tight uppercase">Live Score</h2>
        </div>
      </div>

      {!compact && podium.length > 0 && (
        <div className="mb-10 flex h-72 items-end justify-center gap-4">
          {podium[1] && (
            <div className="flex flex-col items-center">
              <span className="mb-3 text-lg font-bold">{podium[1].nickname}</span>
              <div className="flex h-36 w-24 items-center justify-center rounded-t-3xl border-t-4 border-slate-300 bg-slate-400 text-4xl font-black">
                2
              </div>
              <span className="mt-3 font-mono text-slate-200">{podium[1].score} pts</span>
            </div>
          )}

          {podium[0] && (
            <div className="flex scale-105 flex-col items-center">
              <TrophyIcon className="mb-3 h-12 w-12 animate-bounce text-yellow-400" />
              <span className="mb-3 text-2xl font-black text-yellow-300">{podium[0].nickname}</span>
              <div className="relative flex h-52 w-28 items-center justify-center rounded-t-3xl border-t-4 border-yellow-300 bg-yellow-500 text-6xl font-black text-slate-950 shadow-2xl">
                1
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
              <span className="mt-3 font-mono text-xl font-black text-yellow-300">{podium[0].score} pts</span>
            </div>
          )}

          {podium[2] && (
            <div className="flex flex-col items-center">
              <span className="mb-3 text-lg font-bold">{podium[2].nickname}</span>
              <div className="flex h-24 w-24 items-center justify-center rounded-t-3xl border-t-4 border-amber-700 bg-amber-800 text-4xl font-black">
                3
              </div>
              <span className="mt-3 font-mono text-amber-200">{podium[2].score} pts</span>
            </div>
          )}
        </div>
      )}

      <div className="grid gap-4">
        {(compact ? players : others).map((player, index) => (
          <div
            key={player.id}
            className={`flex items-center justify-between rounded-2xl border p-4 backdrop-blur-sm transition ${cardClasses(player.status)}`}
          >
            <div className="flex items-center gap-4">
              <span className="w-8 text-xl font-black text-indigo-300">
                {player.rank ?? index + 1}
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/30">
                <UserCircleIcon className="h-7 w-7 text-indigo-200" />
              </div>
              <div>
                <p className="text-lg font-bold">{player.nickname}</p>
                <p className="text-xs uppercase tracking-[0.2em] opacity-70">
                  {player.correctAnswers} bonnes - {player.wrongAnswers} erreurs
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-mono text-xl font-bold text-emerald-300">{player.score}</p>
              <p className="text-xs uppercase tracking-[0.2em] opacity-70">{player.status}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
