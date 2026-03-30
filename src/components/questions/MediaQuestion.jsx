export default function MediaQuestion({ data, onAnswer, disabled = false }) {
  const mediaUrl = data.mediaUrl || data.mediaPath;
  const isVideo = /\.mp4$/i.test(mediaUrl ?? "");

  return (
    <div className="w-full max-w-4xl">
      <div className="mb-8 flex justify-center rounded-[2rem] bg-white p-4 shadow-2xl">
        {mediaUrl ? (
          isVideo ? (
            <video src={mediaUrl} autoPlay loop muted className="max-h-80 rounded-xl" />
          ) : (
            <img src={mediaUrl} alt="Question media" className="max-h-80 rounded-xl object-contain" />
          )
        ) : (
          <div className="grid h-72 w-full place-items-center rounded-2xl bg-slate-100 text-center text-slate-500">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em]">Media</p>
              <p className="mt-3 text-lg">{data.mediaPath || "Aucun media disponible"}</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {data.options.map((option) => (
          <button
            key={option.id}
            type="button"
            disabled={disabled}
            onClick={() => onAnswer(option.id)}
            className="rounded-full bg-indigo-600 px-6 py-5 text-left text-xl font-bold text-white shadow-lg transition-all hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-55"
          >
            <span className="mr-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-sm uppercase tracking-[0.3em]">
              {option.label}
            </span>
            {option.text}
          </button>
        ))}
      </div>
    </div>
  );
}
