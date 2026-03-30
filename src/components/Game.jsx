import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QCM from './questions/QCM';
import MediaQuestion from './questions/MediaQuestion';
import FillBlank from './questions/FillBlank';

// Simulation de tes données (tu pourras les mettre dans un fichier à part plus tard)
const questionsData = [
    {
        type: "QCM",
        question: "Quel est le nom de ce mème ?",
        options: ["Doge", "Cheems", "Walter", "Grumpy Cat"],
        answer: "Doge"
    },
    {
        type: "MEDIA",
        question: "De quel mème s'agit-il ?",
        mediaUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJueXp4bmZ4bmZ4bmZ4bmZ4bmZ4bmZ4JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/Ju7l5y9osyymQ/giphy.gif",
        options: ["Never Gonna Give You Up", "Nyan Cat", "Sandstorm"],
        answer: "Never Gonna Give You Up"
    },
    {
        type: "TEXTE_A_TROUS",
        question: "Complète la phrase :",
        phrase: "One does not simply walk into _____",
        answer: "Mordor"
    }
];

export default function Game() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [score, setScore] = useState(0);
    const [showFeedback, setShowFeedback] = useState(false);
    const [lastResult, setLastResult] = useState(null);
    const [isFinished, setIsFinished] = useState(false);

    const currentQuestion = questionsData[currentStep];

    const handleAnswer = (isCorrect) => {
        setLastResult(isCorrect);
        setShowFeedback(true);

        if (isCorrect) {
            setScore(prev => prev + 100);
        }

        // Petit délai pour laisser l'utilisateur voir s'il a eu juste (La "Correction")
        setTimeout(() => {
            setShowFeedback(false);
            if (currentStep < questionsData.length - 1) {
                setCurrentStep(prev => prev + 1);
            } else {
                setIsFinished(true);
            }
        }, 1500);
    };

    if (isFinished) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-white">
                <h1 className="text-6xl font-black mb-4 animate-bounce">FIN DE PARTIE 🏆</h1>
                <p className="text-3xl">Ton score : <span className="text-yellow-400">{score} pts</span></p>
                <button
                    onClick={() => navigate('/')}
                    className="mt-8 bg-white text-indigo-900 px-8 py-3 rounded-full font-bold hover:bg-gray-200"
                >
                    Rejouer
                </button>
            </div>
        );
    }

    return (
        <div className="relative w-full max-w-5xl mx-auto pt-10 px-4">
            {/* Barre de progression et Score */}
            <div className="flex justify-between items-center mb-10 text-white font-bold">
                <div className="bg-black/20 px-4 py-2 rounded-full border border-white/20">
                    Question {currentStep + 1} / {questionsData.length}
                </div>
                <div className="text-2xl bg-yellow-500 px-6 py-2 rounded-full shadow-lg">
                    {score} pts
                </div>
            </div>

            {/* Overlay de Feedback (Correction) */}
            {showFeedback && (
                <div className={`fixed inset-0 z-50 flex items-center justify-center animate-in fade-in zoom-in duration-300 ${lastResult ? 'bg-green-500/90' : 'bg-red-500/90'}`}>
                    <h2 className="text-6xl font-black text-white italic">
                        {lastResult ? "BIEN JOUÉ ! ✅" : "DOMMAGE... ❌"}
                    </h2>
                </div>
            )}

            {/* Rendu des questions selon le type */}
            <div className="flex justify-center">
                {currentQuestion.type === "QCM" && (
                    <QCM data={currentQuestion} onAnswer={handleAnswer} />
                )}
                {currentQuestion.type === "MEDIA" && (
                    <MediaQuestion data={currentQuestion} onAnswer={handleAnswer} />
                )}
                {currentQuestion.type === "TEXTE_A_TROUS" && (
                    <FillBlank data={currentQuestion} onAnswer={handleAnswer} />
                )}
            </div>
        </div>
    );
}