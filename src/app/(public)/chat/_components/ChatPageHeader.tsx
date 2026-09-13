"use client";

export default function ChatPageHeader() {
  return (
    <div className="px-4 md:px-6 pt-4 md:pt-6 pb-3">
      <div className="flex items-center gap-3">
        {/* ICON */}
        <div className="relative shrink-0">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 blur-lg opacity-40" />
          <div className="relative w-11 h-11 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-xl shadow-violet-500/30">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 md:w-6 md:h-6"
            >
              <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
            </svg>
          </div>
        </div>

        {/* TEXT */}
        <div className="min-w-0 flex-1">
          <h1 className="text-lg md:text-xl font-bold tracking-tight leading-tight">
            Ruang Obrolan
          </h1>
          <p className="text-xs md:text-sm text-neutral-500 mt-0.5">
            Ngobrol bareng pengunjung atau tanya AI
          </p>
        </div>
      </div>
    </div>
  );
}