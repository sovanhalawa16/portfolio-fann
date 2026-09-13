"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import MessageActionMenu from "./MessageActionMenu";
import ReactionBar from "./ReactionBar";

type LiveMessage = {
  id: number;
  user_id: string;
  user_name: string;
  user_avatar: string | null;
  content: string;
  message_type: string;
  created_at: string;
  edited_at?: string | null;
  deleted_at: string | null;
  reply_to_id?: number | null;
  reply_to?: {
    id: number;
    user_name: string;
    content: string;
  } | null;
};

type Reaction = {
  emoji: string;
  count: number;
  users: string[];
  hasReacted: boolean;
};

const LONG_PRESS_MS = 450;
const SWIPE_THRESHOLD = 60;
const MAX_SWIPE = 90;

const Icons = {
  Reply: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M9 17H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2h-4" />
      <path d="M3 9l4 4-4 4" />
    </svg>
  ),
  Check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
      <path d="M5 12l5 5L20 7" />
    </svg>
  ),
  Close: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  ),
  More: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <circle cx="12" cy="5" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="12" cy="19" r="1.5" />
    </svg>
  ),
};

export default function LiveMessageBubble({
  message,
  isOwnMessage,
  reactions = [],
  onDelete,
  onEdit,
  onReply,
  onReact,
}: {
  message: LiveMessage;
  isOwnMessage: boolean;
  reactions?: Reaction[];
  onDelete?: (id: number) => void;
  onEdit?: (id: number, newContent: string) => void;
  onReply?: (message: LiveMessage) => void;
  onReact?: (messageId: number, emoji: string) => void;
}) {
  const [showActions, setShowActions] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [menuPlacement, setMenuPlacement] = useState<"top" | "bottom">("top");
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(message.content);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [replyTriggered, setReplyTriggered] = useState(false);

  const editRef = useRef<HTMLTextAreaElement>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isSwipingRef = useRef(false);
  const hasMoved = useRef(false);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing && editRef.current) {
      editRef.current.focus();
      editRef.current.setSelectionRange(
        editRef.current.value.length,
        editRef.current.value.length
      );
    }
  }, [isEditing]);

  const time = new Date(message.created_at).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const initial = (message.user_name || "?").charAt(0).toUpperCase();
  const isEdited =
    message.edited_at && message.edited_at !== message.created_at;

  // ========== SMART MENU POSITIONING ==========
  const openMenu = () => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const viewportH = window.innerHeight;
    const menuHeight = 320; // estimasi tinggi menu (reactions + items)

    // Kalo ruang di atas < menuHeight + 20px → muncul di bawah
    const spaceAbove = rect.top;
    const spaceBelow = viewportH - rect.bottom;

    if (spaceAbove < menuHeight + 20 && spaceBelow > spaceAbove) {
      setMenuPlacement("bottom");
    } else {
      setMenuPlacement("top");
    }

    setShowMenu(true);
  };

  const handleDelete = () => {
    if (!confirm("Hapus pesan ini?")) return;
    onDelete?.(message.id);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
    } catch {}
  };

  const handleSaveEdit = () => {
    const trimmed = editValue.trim();
    if (!trimmed) return;
    if (trimmed === message.content) {
      setIsEditing(false);
      return;
    }
    onEdit?.(message.id, trimmed);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditValue(message.content);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  // ========== TOUCH LOGIC ==========
  const clearLongPress = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
    hasMoved.current = false;
    isSwipingRef.current = false;
    setReplyTriggered(false);

    clearLongPress();
    longPressTimer.current = setTimeout(() => {
      if (!hasMoved.current) {
        if (navigator.vibrate) navigator.vibrate(15);
        openMenu();
        isSwipingRef.current = false;
      }
    }, LONG_PRESS_MS);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartX.current;
    const dy = touch.clientY - touchStartY.current;

    if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
      hasMoved.current = true;
      clearLongPress();
    }

    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
      isSwipingRef.current = true;
      setIsSwiping(true);

      if (e.cancelable) e.preventDefault();

      const validDirection = isOwnMessage ? dx < 0 : dx > 0;
      const visualDx = validDirection ? dx : dx * 0.2;

      const clamped = Math.max(-MAX_SWIPE, Math.min(MAX_SWIPE, visualDx));
      setSwipeOffset(clamped);

      if (Math.abs(clamped) >= SWIPE_THRESHOLD && !replyTriggered) {
        setReplyTriggered(true);
        if (navigator.vibrate) navigator.vibrate(10);
      } else if (Math.abs(clamped) < SWIPE_THRESHOLD && replyTriggered) {
        setReplyTriggered(false);
      }
    }
  };

  const handleTouchEnd = () => {
    clearLongPress();

    if (isSwipingRef.current && replyTriggered && onReply) {
      onReply(message);
    }

    setIsSwiping(false);
    setSwipeOffset(0);
    setReplyTriggered(false);
    isSwipingRef.current = false;
  };

  return (
    <div
      ref={containerRef}
      className={`flex gap-2.5 md:gap-3 relative group ${
        isOwnMessage ? "flex-row-reverse" : ""
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* SWIPE REPLY ICON */}
      {isSwiping && (swipeOffset > 0 || swipeOffset < 0) && (
        <div
          className={`absolute top-1/2 -translate-y-1/2 pointer-events-none transition-opacity ${
            isOwnMessage ? "left-0" : "right-0"
          } ${replyTriggered ? "opacity-100 scale-110" : "opacity-40 scale-90"}`}
          style={{
            [isOwnMessage ? "left" : "right"]: "8px",
          }}
        >
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
              replyTriggered
                ? "bg-violet-500 text-white shadow-lg shadow-violet-500/40"
                : "bg-neutral-800 text-neutral-400"
            }`}
          >
            {Icons.Reply}
          </div>
        </div>
      )}

      {/* AVATAR */}
      <div className="shrink-0 w-8 h-8 md:w-9 md:h-9 rounded-full overflow-hidden ring-2 ring-neutral-800 bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-xs font-bold text-white z-10">
        {message.user_avatar ? (
          <img
            src={message.user_avatar}
            alt={message.user_name}
            className="w-full h-full object-cover"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        ) : (
          initial
        )}
      </div>

      {/* CONTENT */}
      <div
        ref={bubbleRef}
        className={`flex flex-col max-w-[80%] md:max-w-[70%] relative z-10 ${
          isOwnMessage ? "items-end" : "items-start"
        }`}
        style={{
          transform: `translateX(${swipeOffset}px)`,
          transition: isSwiping
            ? "none"
            : "transform 250ms cubic-bezier(0.34,1.2,0.64,1)",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onContextMenu={(e) => {
          e.preventDefault();
          openMenu();
        }}
      >
        {/* NAME */}
        <div
          className={`text-[10px] font-bold mb-1 px-1 ${
            isOwnMessage ? "text-blue-400" : "text-neutral-400"
          }`}
        >
          {isOwnMessage ? "Kamu" : message.user_name}
        </div>

        {/* REPLY PREVIEW */}
        {message.reply_to && (
          <div
            className={`mb-1 max-w-full rounded-lg border-l-2 border-violet-500 bg-neutral-900/60 px-2.5 py-1.5 text-[11px] ${
              isOwnMessage ? "text-right" : ""
            }`}
          >
            <div className="text-[10px] font-bold text-violet-400 mb-0.5">
              ↩ {message.reply_to.user_name}
            </div>
            <div className="text-neutral-400 line-clamp-1">
              {message.reply_to.content}
            </div>
          </div>
        )}

        {/* BUBBLE / EDIT */}
        {isEditing ? (
          <div className="w-full min-w-[200px] md:min-w-[300px] rounded-2xl border border-violet-500/40 bg-neutral-900 p-2">
            <textarea
              ref={editRef}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={2}
              className="w-full resize-none bg-transparent focus:outline-none text-sm text-neutral-200 leading-relaxed overflow-hidden"
              style={{ maxHeight: "120px" }}
            />
            <div className="flex items-center justify-end gap-1 mt-2 pt-2 border-t border-neutral-800/60">
              <button
                onClick={handleCancelEdit}
                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] text-neutral-500 hover:text-white hover:bg-neutral-800 transition"
              >
                {Icons.Close}
                Batal
              </button>
              <button
                onClick={handleSaveEdit}
                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-medium text-white bg-violet-500 hover:bg-violet-600 transition"
              >
                {Icons.Check}
                Simpan
              </button>
            </div>
          </div>
        ) : (
          <div
            className={`relative rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words select-none md:select-text ${
              isOwnMessage
                ? "bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-tr-sm shadow-lg shadow-blue-500/20"
                : "bg-neutral-900/80 border border-neutral-800 text-neutral-200 rounded-tl-sm"
            }`}
            style={{
              WebkitTouchCallout: "none",
              WebkitUserSelect: "none",
              userSelect: "none",
            }}
          >
            {message.content}
          </div>
        )}

        {/* TIMESTAMP + EDITED */}
        <div
          className={`flex items-center gap-1.5 mt-1 px-1 ${
            isOwnMessage ? "flex-row-reverse" : ""
          }`}
        >
          <span className="text-[10px] text-neutral-600">{time}</span>
          {isEdited && (
            <span className="text-[10px] text-neutral-600 italic">
              (diedit)
            </span>
          )}
        </div>

        {/* REACTIONS */}
        {onReact && (
          <ReactionBar
            reactions={reactions}
            onReact={(emoji) => onReact(message.id, emoji)}
            isOwnMessage={isOwnMessage}
          />
        )}

        {/* DESKTOP HOVER BUTTONS */}
        {showActions && !isEditing && !showMenu && (
          <div
            className={`hidden md:flex absolute top-6 items-center gap-0.5 ${
              isOwnMessage
                ? "left-0 -translate-x-full pr-1"
                : "right-0 translate-x-full pl-1"
            }`}
          >
            <button
              onClick={openMenu}
              className="w-7 h-7 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-500 hover:text-white hover:bg-neutral-800 transition"
              title="Menu"
            >
              {Icons.More}
            </button>
          </div>
        )}

        {/* POPUP MENU */}
        {showMenu && (
          <MessageActionMenu
            isOwnMessage={isOwnMessage}
            placement={menuPlacement}
            hasReply={!!onReply}
            hasEdit={isOwnMessage && !!onEdit}
            hasDelete={isOwnMessage && !!onDelete}
            hasReact={!!onReact}
            onReact={(emoji) => onReact?.(message.id, emoji)}
            onReply={() => onReply?.(message)}
            onEdit={isOwnMessage && onEdit ? () => setIsEditing(true) : undefined}
            onDelete={isOwnMessage && onDelete ? handleDelete : undefined}
            onCopy={handleCopy}
            onClose={() => setShowMenu(false)}
          />
        )}
      </div>
    </div>
  );
}