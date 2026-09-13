"use client";

import { useEffect, useRef } from "react";

const QUICK_REACTIONS = ["❤️", "😂", "👍", "🔥", "😮", "😢", "🎉", "💯"];

const Icons = {
  Reply: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M9 17H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2h-4" />
      <path d="M3 9l4 4-4 4" />
    </svg>
  ),
  Edit: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  Copy: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  ),
  Trash: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
    </svg>
  ),
};

type Props = {
  isOwnMessage: boolean;
  placement: "top" | "bottom";
  hasEdit: boolean;
  hasDelete: boolean;
  hasReply: boolean;
  hasReact: boolean;
  onReact: (emoji: string) => void;
  onReply: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onCopy: () => void;
  onClose: () => void;
};

export default function MessageActionMenu({
  isOwnMessage,
  placement,
  hasEdit,
  hasDelete,
  hasReply,
  hasReact,
  onReact,
  onReply,
  onEdit,
  onDelete,
  onCopy,
  onClose,
}: Props) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }, 100);
    document.addEventListener("keydown", handleEsc);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className={`absolute z-50 rounded-2xl border border-neutral-800 bg-neutral-950/98 backdrop-blur-2xl shadow-2xl overflow-hidden animate-[menuIn_180ms_cubic-bezier(0.34,1.2,0.64,1)] ${
        isOwnMessage ? "right-0" : "left-0"
      } ${
        placement === "top" ? "bottom-full mb-2" : "top-full mt-2"
      }`}
      style={{
        minWidth: "240px",
        maxWidth: "calc(100vw - 40px)",
        transformOrigin: placement === "top" ? "bottom" : "top",
      }}
    >
      {/* QUICK REACTIONS */}
      {hasReact && (
        <div
          className="flex items-center gap-0.5 p-1.5 overflow-x-auto scrollbar-hide border-b border-neutral-800/60"
          style={{ scrollbarWidth: "none" }}
        >
          {QUICK_REACTIONS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                onReact(emoji);
                onClose();
              }}
              className="shrink-0 w-10 h-10 rounded-xl hover:bg-neutral-800 active:scale-90 flex items-center justify-center text-2xl transition-all"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* MENU ITEMS */}
      <div className="py-1">
        {hasReply && (
          <button
            onClick={() => {
              onReply();
              onClose();
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-900 active:bg-neutral-800 transition text-left text-sm text-neutral-300 hover:text-white"
          >
            <span className="text-blue-400">{Icons.Reply}</span>
            <span className="font-medium">Balas</span>
          </button>
        )}

        <button
          onClick={() => {
            onCopy();
            onClose();
          }}
          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-900 active:bg-neutral-800 transition text-left text-sm text-neutral-300 hover:text-white"
        >
          <span className="text-neutral-500">{Icons.Copy}</span>
          <span className="font-medium">Salin</span>
        </button>

        {isOwnMessage && hasEdit && onEdit && (
          <button
            onClick={() => {
              onEdit();
              onClose();
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-900 active:bg-neutral-800 transition text-left text-sm text-neutral-300 hover:text-white"
          >
            <span className="text-violet-400">{Icons.Edit}</span>
            <span className="font-medium">Edit</span>
          </button>
        )}

        {isOwnMessage && hasDelete && onDelete && (
          <button
            onClick={() => {
              onDelete();
              onClose();
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-950/30 active:bg-red-900/30 transition text-left text-sm text-red-400 hover:text-red-300"
          >
            <span>{Icons.Trash}</span>
            <span className="font-medium">Hapus</span>
          </button>
        )}
      </div>

      <style jsx global>{`
        @keyframes menuIn {
          from {
            opacity: 0;
            transform: translateY(${placement === "top" ? "6px" : "-6px"}) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}