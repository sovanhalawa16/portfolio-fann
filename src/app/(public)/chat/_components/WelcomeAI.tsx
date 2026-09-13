"use client";

const QUICK_PROMPTS = [
  { icon: "👋", text: "Siapa Fann?" },
  { icon: "💼", text: "Apa aja project Fann?" },
  { icon: "📄", text: "Publikasi Fann apa aja?" },
  { icon: "🛠️", text: "Tech stack yang Fann pake?" },
];

export default function WelcomeAI({
  onPromptClick,
}: {
  onPromptClick: (prompt: string) => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto text-center px-4">
      {/* AVATAR */}
      <div className="relative mb-5">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 blur-xl opacity-40" />
        <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-2xl">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-8 h-8 md:w-10 md:h-10"
          >
            <path d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7v2a2 2 0 01-2 2h-2v2a2 2 0 01-2 2H9a2 2 0 01-2-2v-2H5a2 2 0 01-2-2v-2a7 7 0 017-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 012-2z" />
            <path d="M9 12h.01M15 12h.01M9 16h6" />
          </svg>
        </div>
      </div>

      {/* TITLE */}
      <h2 className="text-xl md:text-2xl font-bold mb-2">
        Hai! Gue Fann AI 👋
      </h2>
      <p className="text-sm text-neutral-400 leading-relaxed mb-6">
        Tanya apa aja tentang Fann — pengalaman, project, publikasi, atau
        sekadar ngobrol santai. Gue siap bantu!
      </p>

      {/* QUICK PROMPTS */}
      <div className="w-full space-y-2">
        <div className="text-[10px] font-bold text-neutral-600 uppercase tracking-wider text-left mb-2">
          Coba tanya:
        </div>
        {QUICK_PROMPTS.map((prompt, i) => (
          <button
            key={i}
            onClick={() => onPromptClick(prompt.text)}
            className="w-full text-left rounded-xl border border-neutral-800 bg-neutral-900/40 hover:bg-neutral-900 hover:border-violet-500/40 px-4 py-3 text-sm text-neutral-300 hover:text-white transition-all group"
            style={{
              animation: `fadeIn 500ms ease-out ${i * 100}ms both`,
            }}
          >
            <span className="mr-2">{prompt.icon}</span>
            {prompt.text}
          </button>
        ))}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}