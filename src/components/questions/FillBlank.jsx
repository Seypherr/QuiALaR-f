import { useState } from 'react';

export default function FillBlank({ data, onAnswer }) {
    const [val, setVal] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        onAnswer(val.trim().toLowerCase() === data.answer.toLowerCase());
    };

    return (
        <div className="w-full max-w-2xl bg-white p-10 rounded-3xl shadow-2xl text-center">
            <h2 className="text-gray-500 uppercase tracking-widest text-sm mb-2">Complète le mème</h2>
            <p className="text-3xl font-serif italic mb-8 text-gray-800">"{data.phrase}"</p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                    autoFocus
                    type="text"
                    value={val}
                    onChange={(e) => setVal(e.target.value)}
                    placeholder="Ta réponse..."
                    className="text-2xl p-4 border-b-4 border-indigo-500 focus:outline-none text-center text-indigo-600 font-bold"
                />
                <button
                    type="submit"
                    className="bg-indigo-600 text-white py-4 rounded-xl font-bold text-xl hover:bg-indigo-700 transition"
                >
                    Valider ma réponse
                </button>
            </form>
        </div>
    );
}