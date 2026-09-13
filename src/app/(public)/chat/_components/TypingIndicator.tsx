"use client";

export default function TypingIndicator({ isAI = false }: { isAI?: boolean }) {
  return (
    <div className="flex gap-2.5 md:gap-3">
      <div
        className={`shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-white shadow-lg ${
          isAI
            ? "bg-gradient-to-br from-violet-500 to-fuchsia-500"
            : "bg-gradient-to-br from-blue-500 to-cyan-500"
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-3.5 h-3.5 md:w-4 md:h-4"
        >
          <path d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7v2a2 2 0 01-2 2h-2v2a2 2 0 01-2 2H9a2 2 0 01-2-2v-2H5a2 2 0 01-2-2v-2a7 7 0 017-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 012-2z" />
          <path d="M9 12h.01M15 12h.01M9 16h6" />
        </svg>
      </div>

      <div className="flex flex-col items-start">
        <div className="text-[10px] font-bold text-violet-400 mb-1 px-1">
          Fann AI
        </div>
        <div className="rounded-2xl rounded-tl-sm bg-neutral-900/80 border border-neutral-800 px-4 py-3 flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
          <span className="text-xs text-neutral-500 italic">Sedang berpikir...</span>
        </div>
      </div>
    </div>
  );
}