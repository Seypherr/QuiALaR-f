const colors = [
  "bg-red-500 hover:bg-red-400 text-white",
  "bg-blue-500 hover:bg-blue-400 text-white",
  "bg-yellow-400 hover:bg-yellow-300 text-slate-950",
  "bg-green-500 hover:bg-green-400 text-white",
];

export default function QCM({ data, onAnswer, disabled = false }) {
  return (
    <div className="w-full max-w-4xl">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {data.options.map((option, index) => (
          <button
            key={option.id}
            type="button"
            disabled={disabled}
            onClick={() => onAnswer(option.id)}
            className={`rounded-3xl px-5 py-8 text-left text-xl font-black shadow-xl transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-55 ${colors[index % colors.length]}`}
          >
            <span className="mb-3 block text-sm uppercase tracking-[0.35em] opacity-80">
              {option.label}
            </span>
            <span className="block text-2xl leading-snug">{option.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
