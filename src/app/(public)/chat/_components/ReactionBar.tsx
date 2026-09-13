"use client";

type Reaction = {
  emoji: string;
  count: number;
  users: string[];
  hasReacted: boolean;
};

export default function ReactionBar({
  reactions,
  onReact,
  isOwnMessage,
}: {
  reactions: Reaction[];
  onReact: (emoji: string) => void;
  isOwnMessage: boolean;
}) {
  if (reactions.length === 0) return null;

  return (
    <div
      className={`flex flex-wrap gap-1 mt-1.5 ${
        isOwnMessage ? "justify-end" : "justify-start"
      }`}
    >
      {reactions.map((reaction) => (
        <button
          key={reaction.emoji}
          onClick={() => onReact(reaction.emoji)}
          title={reaction.users.join(", ")}
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs transition-all hover:scale-105 ${
            reaction.hasReacted
              ? "bg-violet-500/20 border border-violet-500/40 text-violet-200"
              : "bg-neutral-900/80 border border-neutral-800 text-neutral-400 hover:border-neutral-700"
          }`}
        >
          <span className="text-sm">{reaction.emoji}</span>
          <span className="font-medium tabular-nums">{reaction.count}</span>
        </button>
      ))}
    </div>
  );
}