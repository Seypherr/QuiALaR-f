import { useState, useEffect } from 'react';
import { TrophyIcon, UserCircleIcon } from '@heroicons/react/24/solid';

export default function LeaderboardLive() {
    const [players, setPlayers] = useState([]);
    const API_URL = "http://localhost/ton-projet-php"; // L'URL de ton collègue

    useEffect(() => {
        // Fonction pour récupérer les scores depuis le PHP
        const fetchScores = async () => {
            try {
                const response = await fetch(`${API_URL}/get_leaderboard.php`);
                const data = await response.json();
                setPlayers(data); // On attend un tableau d'objets [{name, score}, ...]
            } catch (err) {
                console.error("Erreur lors de la récup des scores", err);
            }
        };

        // Appeler tout de suite au chargement
        fetchScores();

        // Puis rafraîchir toutes les 3 secondes pour le "Live"
        const interval = setInterval(fetchScores, 3000);

        return () => clearInterval(interval);
    }, []);

    // Le reste de ta logique de tri reste identique
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
    const podium = sortedPlayers.slice(0, 3);
    const others = sortedPlayers.slice(3);

    return (
        <div className="min-h-screen bg-indigo-950 p-8 text-white flex flex-col items-center overflow-hidden">
            {/* Titre avec animation de pulsation pour montrer que c'est du direct */}
            <div className="flex items-center gap-4 mb-12">
                <div className="relative">
                    <TrophyIcon className="h-16 w-16 text-yellow-400" />
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
                    </span>
                </div>
                <h1 className="text-6xl font-black tracking-tighter uppercase">Live Score</h1>
            </div>

            {/* SECTION PODIUM (ton code original est très bien, on le garde) */}
            <div className="flex items-end justify-center gap-6 mb-16 h-80 w-full max-w-4xl">
                {/* 2ème Place */}
                {podium[1] && (
                    <div className="flex flex-col items-center transition-all duration-500">
                        <span className="font-bold mb-3 text-xl">{podium[1].name}</span>
                        <div className="bg-slate-400 w-32 h-40 rounded-t-2xl flex items-center justify-center text-4xl font-black shadow-lg border-t-4 border-slate-300">2</div>
                        <span className="mt-3 text-slate-300 font-mono">{podium[1].score} pts</span>
                    </div>
                )}

                {/* 1ère Place */}
                {podium[0] && (
                    <div className="flex flex-col items-center transition-all duration-500 scale-110">
                        <TrophyIcon className="h-12 w-12 text-yellow-400 mb-3 animate-bounce" />
                        <span className="font-black mb-3 text-3xl text-yellow-400">{podium[0].name}</span>
                        <div className="bg-yellow-500 w-40 h-60 rounded-t-2xl flex items-center justify-center text-7xl font-black shadow-2xl border-t-4 border-yellow-300 relative">
                            1
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                        </div>
                        <span className="mt-3 font-black text-2xl text-yellow-500 font-mono">{podium[0].score} pts</span>
                    </div>
                )}

                {/* 3ème Place */}
                {podium[2] && (
                    <div className="flex flex-col items-center transition-all duration-500">
                        <span className="font-bold mb-3 text-xl">{podium[2].name}</span>
                        <div className="bg-amber-800 w-32 h-28 rounded-t-2xl flex items-center justify-center text-4xl font-black shadow-lg border-t-4 border-amber-700">3</div>
                        <span className="mt-3 text-amber-700 font-mono">{podium[2].score} pts</span>
                    </div>
                )}
            </div>

            {/* LE RESTE DU CLASSEMENT */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-5xl">
                {others.map((player, index) => (
                    <div
                        key={index}
                        className="bg-white/5 backdrop-blur-sm p-5 rounded-2xl flex justify-between items-center border border-white/10 transform transition hover:scale-105"
                    >
                        <div className="flex items-center gap-4">
                            <span className="text-indigo-400 font-black text-xl w-8">{index + 4}</span>
                            <div className="h-10 w-10 rounded-full bg-indigo-500/30 flex items-center justify-center">
                                <UserCircleIcon className="h-7 w-7 text-indigo-200" />
                            </div>
                            <span className="font-bold text-lg">{player.name}</span>
                        </div>
                        <span className="font-mono text-xl text-green-400 font-bold">{player.score}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}