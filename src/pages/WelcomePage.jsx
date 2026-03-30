import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createRoom } from "../api/lobby";

export default function WelcomePage() {
  const navigate = useNavigate();
  const [hostName, setHostName] = useState("Host Qui a la réf ?");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCreateRoom(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await createRoom({
        hostName,
        themeId: 1,
        maxPlayers: 8,
      });

      navigate(`/screen?room=${result.room.roomCode}`);
    } catch (createError) {
      setError(createError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white text-slate-950">
      <header className="absolute inset-x-0 top-0 z-30">
        <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8">
          <div className="flex items-center gap-3">
            <img alt="Qui a la réf ?" src="/img/minion.jpg" className="h-10 w-10 rounded-lg object-cover" />
            <span className="bg-gradient-to-r from-indigo-600 to-pink-500 bg-clip-text text-2xl font-black tracking-wider text-transparent">
              Qui a la réf ?
            </span>
          </div>

          <Link
            to="/scan"
            className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-600"
          >
            Rejoindre une room
          </Link>
        </nav>
      </header>

      <main className="relative isolate overflow-hidden">
        <svg
          aria-hidden="true"
          className="absolute inset-x-0 top-0 -z-10 h-256 w-full mask-[radial-gradient(32rem_32rem_at_center,white,transparent)] stroke-slate-200"
        >
          <defs>
            <pattern
              x="50%"
              y={-1}
              id="enigma-grid"
              width={200}
              height={200}
              patternUnits="userSpaceOnUse"
            >
              <path d="M.5 200V.5H200" fill="none" />
            </pattern>
          </defs>
          <rect fill="url(#enigma-grid)" width="100%" height="100%" strokeWidth={0} />
        </svg>

        <div
          aria-hidden="true"
          className="absolute top-0 right-0 left-1/2 -z-10 -ml-24 overflow-hidden blur-3xl lg:ml-24 xl:ml-48"
        >
          <div
            style={{
              clipPath:
                "polygon(63.1% 29.5%, 100% 17.1%, 76.6% 3%, 48.4% 0%, 44.6% 4.7%, 54.5% 25.3%, 59.8% 49%, 55.2% 57.8%, 44.4% 57.2%, 27.8% 47.9%, 35.1% 81.5%, 0% 97.7%, 39.2% 100%, 35.2% 81.4%, 97.2% 52.8%, 63.1% 29.5%)",
            }}
            className="aspect-[801/1036] w-[50rem] bg-gradient-to-tr from-pink-300 to-indigo-300 opacity-40"
          />
        </div>

        <div className="mx-auto max-w-7xl px-6 pt-32 pb-20 lg:px-8 lg:pt-24">
          <div className="mx-auto flex max-w-6xl flex-col gap-14 lg:flex-row lg:items-center">
            <section className="w-full lg:max-w-xl xl:max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-indigo-500">
                Quiz Battle Royale
              </p>
              <h1 className="mt-6 text-5xl font-black tracking-tight text-pretty sm:text-7xl">
                Expert en meme ?
              </h1>
              <p className="mt-8 max-w-xl text-lg font-medium text-slate-500 sm:text-xl/8">
                Creez une room sur PC, faites rejoindre jusqu a 8 joueurs sur telephone
                et laissez le serveur piloter les questions, les scores et les
                eliminations en direct.
              </p>

              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Joueurs</p>
                  <p className="mt-2 text-3xl font-black text-indigo-600">8 max</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Reponses</p>
                  <p className="mt-2 text-3xl font-black text-pink-500">A B C D</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Elimination</p>
                  <p className="mt-2 text-3xl font-black text-amber-500">120s</p>
                </div>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-4">
                <button
                  type="submit"
                  form="create-room-form"
                  disabled={loading}
                  className="rounded-md bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Creation..." : "Creer la room"}
                </button>
                <Link
                  to="/scan"
                  className="rounded-md border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-600"
                >
                  Rejoindre avec un code
                </Link>
              </div>
            </section>

            <section className="flex w-full flex-col gap-8 lg:max-w-2xl">
              <div className="flex justify-end gap-8 sm:-mt-10 sm:justify-start sm:pl-20 lg:mt-0 lg:pl-0">
                <div className="ml-auto w-40 flex-none space-y-8 pt-28 sm:ml-0 sm:pt-72 lg:order-last lg:pt-28 xl:order-none xl:pt-72">
                  <img alt="" src="/img/think-about-it.jpg" className="aspect-[2/3] w-full rounded-xl object-cover shadow-lg ring-1 ring-slate-900/10" />
                </div>
                <div className="mr-auto w-40 flex-none space-y-8 sm:mr-0 sm:pt-48 lg:pt-24">
                  <img alt="" src="/img/idk.jpg" className="aspect-[2/3] w-full rounded-xl object-cover shadow-lg ring-1 ring-slate-900/10" />
                  <img alt="" src="/img/shrek.jpg" className="aspect-[2/3] w-full rounded-xl object-cover shadow-lg ring-1 ring-slate-900/10" />
                </div>
                <div className="w-40 flex-none space-y-8 pt-28 sm:pt-0">
                  <img alt="" src="/img/cry.jpg" className="aspect-[2/3] w-full rounded-xl object-cover shadow-lg ring-1 ring-slate-900/10" />
                  <img alt="" src="/img/cat.jpg" className="aspect-[2/3] w-full rounded-xl object-cover shadow-lg ring-1 ring-slate-900/10" />
                </div>
              </div>

              <form
                id="create-room-form"
                onSubmit={handleCreateRoom}
                className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-200/60"
              >
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-500">
                  Poste principal
                </p>
                <h2 className="mt-2 text-3xl font-black">Demarrer une nouvelle salle</h2>
                <p className="mt-3 text-slate-500">
                  Le PC affiche la question, le timer, la bonne reponse et le classement en simultane.
                </p>

                <label className="mt-6 block">
                  <span className="mb-2 block text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Nom de l host
                  </span>
                  <input
                    type="text"
                    value={hostName}
                    onChange={(event) => setHostName(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-slate-950 outline-none transition focus:border-indigo-300 focus:bg-white"
                  />
                </label>

                {error && (
                  <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                    {error}
                  </div>
                )}
              </form>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
