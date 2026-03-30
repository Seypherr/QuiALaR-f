export default function MediaQuestion({ data, onAnswer }) {
    return (
        <div className="w-full max-w-4xl flex flex-col items-center">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">{data.question}</h2>

            <div className="bg-white p-4 rounded-3xl shadow-2xl mb-8 w-full flex justify-center">
                {/* Support Image ou Vidéo simple */}
                {data.mediaUrl.endsWith('.mp4') ? (
                    <video src={data.mediaUrl} autoPlay loop muted className="rounded-xl max-h-80" />
                ) : (
                    <img src={data.mediaUrl} alt="Meme ref" className="rounded-xl max-h-80 object-contain" />
                )}
            </div>

            <div className="grid grid-cols-2 gap-4 w-full">
                {data.options.map((opt, i) => (
                    <button
                        key={i}
                        onClick={() => onAnswer(opt === data.answer)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xl py-4 rounded-full transition-all shadow-lg"
                    >
                        {opt}
                    </button>
                ))}
            </div>
        </div>
    );
}