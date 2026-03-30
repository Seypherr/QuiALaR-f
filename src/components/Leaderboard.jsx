import { TrophyIcon, UserCircleIcon } from '@heroicons/react/24/solid';

export default function Leaderboard({ players }) {
    // On trie les joueurs par score décroissant
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
    const podium = sortedPlayers.slice(0, 3);
    const others = sortedPlayers.slice(3);

    return (
        <div className="min-h-screen bg-indigo-900 p-8 text-white flex flex-col items-center">
            <h1 className="text-5xl font-black mb-12 tracking-tighter flex items-center gap-4">
                <TrophyIcon className="h-12 w-12 text-yellow-400" />
                LEADERBOARD
            </h1>

            {/* SECTION PODIUM */}
            <div className="flex items-end justify-center gap-4 mb-16 h-64">
                {/* 2ème Place */}
                {podium[1] && (
                    <div className="flex flex-col items-center">
                        <span className="font-bold mb-2">{podium[1].name}</span>
                        <div className="bg-gray-400 w-24 h-32 rounded-t-lg flex items-center justify-center text-3xl font-bold shadow-lg">2</div>
                        <span className="mt-2">{podium[1].score} pts</span>
                    </div>
                )}
                {/* 1ère Place */}
                {podium[0] && (
                    <div className="flex flex-col items-center">
                        <TrophyIcon className="h-10 w-10 text-yellow-400 mb-2 animate-bounce" />
                        <span className="font-bold mb-2 text-xl">{podium[0].name}</span>
                        <div className="bg-yellow-500 w-28 h-48 rounded-t-lg flex items-center justify-center text-5xl font-bold shadow-2xl border-x-4 border-yellow-300">1</div>
                        <span className="mt-2 font-bold text-yellow-400 text-lg">{podium[0].score} pts</span>
                    </div>
                )}
                {/* 3ème Place */}
                {podium[2] && (
                    <div className="flex flex-col items-center">
                        <span className="font-bold mb-2">{podium[2].name}</span>
                        <div className="bg-orange-700 w-24 h-24 rounded-t-lg flex items-center justify-center text-3xl font-bold shadow-lg">3</div>
                        <span className="mt-2">{podium[2].score} pts</span>
                    </div>
                )}
            </div>

            {/* LE RESTE DU CLASSEMENT */}
            <div className="w-full max-w-2xl space-y-3">
                {others.map((player, index) => (
                    <div key={index} className="bg-white/10 backdrop-blur-md p-4 rounded-xl flex justify-between items-center border border-white/5 hover:bg-white/20 transition">
                        <div className="flex items-center gap-4">
                            <span className="text-gray-400 font-mono w-6">{index + 4}.</span>
                            <UserCircleIcon className="h-8 w-8 text-indigo-300" />
                            <span className="font-semibold">{player.name}</span>
                        </div>
                        <span className="font-mono text-indigo-300">{player.score} pts</span>
                    </div>
                ))}
            </div>
        </div>
    );
}