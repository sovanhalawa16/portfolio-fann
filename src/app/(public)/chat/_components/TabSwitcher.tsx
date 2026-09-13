"use client";

type Mode = "chatroom" | "ai";

type Props = {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  chatroomEnabled: boolean;
  aiEnabled: boolean;
};

const Icons = {
  Chat: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
    </svg>
  ),
  AI: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7v2a2 2 0 01-2 2h-2v2a2 2 0 01-2 2H9a2 2 0 01-2-2v-2H5a2 2 0 01-2-2v-2a7 7 0 017-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 012-2z" />
      <path d="M9 12h.01M15 12h.01M9 16h6" />
    </svg>
  ),
};

export default function TabSwitcher({
  mode,
  onModeChange,
  chatroomEnabled,
  aiEnabled,
}: Props) {
  const tabs: { value: Mode; label: string; icon: React.ReactNode; enabled: boolean }[] = [
    {
      value: "chatroom",
      label: "Live Chat",
      icon: Icons.Chat,
      enabled: chatroomEnabled,
    },
    {
      value: "ai",
      label: "AI Chatbot",
      icon: Icons.AI,
      enabled: aiEnabled,
    },
  ];

  return (
    <div className="border-b border-neutral-800/60 bg-neutral-950/80 backdrop-blur-xl">
      <div className="flex items-center justify-center md:justify-start gap-3 px-3 md:px-4 py-3">
        {/* SEGMENTED CONTROL */}
        <div className="relative flex items-center rounded-full border border-neutral-800 bg-neutral-900/60 p-1 w-full md:w-auto">
          {tabs.map((tab) => {
            const active = mode === tab.value;
            const disabled = !tab.enabled;
            return (
              <button
                key={tab.value}
                onClick={() => !disabled && onModeChange(tab.value)}
                disabled={disabled}
                className={`relative flex items-center justify-center gap-2 rounded-full px-3 md:px-5 py-2 text-xs md:text-sm font-medium transition-all duration-300 flex-1 md:flex-initial ${
                  active
                    ? "bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/20"
                    : disabled
                    ? "text-neutral-700 cursor-not-allowed"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <span className="shrink-0">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}