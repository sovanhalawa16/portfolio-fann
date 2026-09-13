"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
};

const EMOJIS = [
  "😊", "😂", "🥰", "😎", "🤔", "😅", "🙏", "👍",
  "🔥", "✨", "💯", "❤️", "🎉", "🚀", "💡", "⭐",
  "😭", "😱", "🤣", "😴", "🤝", "👋", "🙌", "💪",
];

export default function MessageInput({
  onSend,
  disabled = false,
  placeholder = "Ketik pesan...",
}: Props) {
  const [value, setValue] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
  }, [value]);

  const handleSend = () => {
    if (!value.trim() || disabled) return;
    onSend(value);
    setValue("");
    setShowEmoji(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-neutral-800/60 bg-neutral-950/80 backdrop-blur-xl p-3 md:p-4">
      {showEmoji && (
        <div className="mb-2 rounded-2xl border border-neutral-800 bg-neutral-900/95 backdrop-blur-xl p-3 shadow-2xl">
          <div className="grid grid-cols-8 gap-1.5 max-h-40 overflow-y-auto">
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  setValue((v) => v + emoji);
                  textareaRef.current?.focus();
                }}
                className="text-xl hover:bg-neutral-800 rounded-lg p-1.5 transition"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto flex items-end gap-2">
        <button
          onClick={() => setShowEmoji(!showEmoji)}
          className={`shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-full border flex items-center justify-center transition ${
            showEmoji
              ? "border-violet-500/40 bg-violet-500/10 text-violet-400"
              : "border-neutral-800 bg-neutral-900/60 text-neutral-500 hover:text-white hover:bg-neutral-900"
          }`}
          aria-label="Emoji"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <circle cx="12" cy="12" r="10" />
            <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" />
          </svg>
        </button>

        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="w-full resize-none rounded-2xl border border-neutral-800 bg-neutral-900/60 focus:border-violet-500/40 focus:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20 px-4 py-2.5 text-sm placeholder:text-neutral-600 disabled:opacity-50 transition-all leading-relaxed overflow-hidden"
            style={{ maxHeight: "120px", scrollbarWidth: "none" }}
          />
          <style jsx>{`
            textarea::-webkit-scrollbar {
              display: none;
            }
          `}</style>
        </div>

        <button
          onClick={handleSend}
          disabled={!value.trim() || disabled}
          className={`shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all ${
            value.trim() && !disabled
              ? "bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30 hover:scale-105 active:scale-95"
              : "bg-neutral-900/60 border border-neutral-800 text-neutral-600 cursor-not-allowed"
          }`}
          aria-label="Kirim"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
        </button>
      </div>
    </div>
  );
}