"use client";

const REACTION_EMOJIS = ["❤️", "😂", "👍", "🔥", "😮", "😢", "🎉", "💯"];

export default function ReactionPicker({
  onSelect,
  onClose,
}: {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
        aria-label="Tutup"
      />
      
      {/* Picker */}
      <div className="absolute bottom-full mb-2 right-0 z-50 rounded-2xl border border-neutral-800 bg-neutral-950/95 backdrop-blur-xl shadow-2xl p-2 flex items-center gap-1 animate-[fadeIn_150ms_ease-out]">
        {REACTION_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => onSelect(emoji)}
            className="w-9 h-9 rounded-xl hover:bg-neutral-800 flex items-center justify-center text-lg transition hover:scale-125"
          >
            {emoji}
          </button>
        ))}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}