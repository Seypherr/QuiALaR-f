export default function QCM({ data, onAnswer }) {
    const colors = ["bg-red-500", "bg-blue-500", "bg-yellow-500", "bg-green-500"];

    return (
        <div className="w-full max-w-4xl flex flex-col items-center">
            <h2 className="text-3xl font-bold text-black mb-6 text-center">{data.question}</h2>

            <div className="bg-white p-4 rounded-2xl mb-6 shadow-lg">
                <img 
                    src="https://i.imgflip.com/9ehk.jpg" 
                    alt="Doge meme" 
                    className="h-48 object-contain rounded-xl"
                />
            </div>

            <div className="grid grid-cols-2 gap-4 w-full">
                {data.options.map((opt, i) => (
                    <button
                        key={i}
                        onClick={() => onAnswer(opt === data.answer)}
                        className={`${colors[i]} hover:brightness-110 text-black text-2xl font-bold py-12 rounded-xl shadow-xl transition-all active:scale-95`}
                    >
                        {opt}
                    </button>
                ))}
            </div>
        </div>
    );
}