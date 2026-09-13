"use client";

import { useState } from "react";
import MarkdownRenderer from "@/components/MarkdownRenderer";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
  isStreaming?: boolean;
  isThinking?: boolean;
};

export default function MessageBubble({
  message,
  isAI = false,
}: {
  message: Message;
  isAI?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const time = new Date(message.created_at).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={`flex gap-2.5 md:gap-3 group ${
        isUser ? "flex-row-reverse" : ""
      }`}
    >
      {/* AVATAR */}
      <div
        className={`shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-[10px] md:text-xs font-bold text-white overflow-hidden shadow-lg ${
          isUser
            ? "bg-gradient-to-br from-blue-500 to-cyan-500"
            : "bg-gradient-to-br from-violet-500 to-fuchsia-500"
        }`}
      >
        {isUser ? (
          "You"
        ) : (
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
        )}
      </div>

      {/* CONTENT */}
      <div
        className={`flex flex-col max-w-[85%] md:max-w-[80%] ${
          isUser ? "items-end" : "items-start"
        }`}
      >
        <div
          className={`text-[10px] font-bold mb-1 px-1 ${
            isUser ? "text-blue-400" : "text-violet-400"
          }`}
        >
          {isUser ? "Kamu" : "Fann AI"}
        </div>

        {/* BUBBLE */}
        <div
          className={`relative rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed break-words ${
            isUser
              ? "bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-tr-sm shadow-lg shadow-blue-500/20 whitespace-pre-wrap"
              : "bg-neutral-900/80 border border-neutral-800 text-neutral-200 rounded-tl-sm"
          }`}
        >
          {/* THINKING STATE */}
          {message.isThinking && !message.content && (
            <div className="flex items-center gap-2 py-0.5">
              <div className="flex items-center gap-1">
                <span
                  className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
              <span className="text-xs text-neutral-500 italic">
                Sedang berpikir...
              </span>
            </div>
          )}

          {/* CONTENT STREAMING */}
          {message.content &&
            (isUser ? (
              <span className="whitespace-pre-wrap">{message.content}</span>
            ) : (
              <>
                <MarkdownRenderer content={message.content} />
                {message.isStreaming && (
                  <span className="inline-block w-2 h-4 ml-0.5 bg-violet-400 animate-pulse align-middle rounded-sm" />
                )}
              </>
            ))}
        </div>

        {/* FOOTER */}
        <div className="flex items-center gap-2 mt-1 px-1 opacity-0 group-hover:opacity-100 transition">
          <span className="text-[10px] text-neutral-600">{time}</span>
          {!message.isStreaming && !message.isThinking && message.content && (
            <button
              onClick={handleCopy}
              className="text-[10px] text-neutral-600 hover:text-white transition flex items-center gap-1"
            >
              {copied ? (
                <>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="w-2.5 h-2.5 text-green-400"
                  >
                    <path d="M5 12l5 5L20 7" />
                  </svg>
                  <span className="text-green-400">Tercopy</span>
                </>
              ) : (
                <>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="w-2.5 h-2.5"
                  >
                    <rect x="9" y="9" width="13" height="13" rx="2" />
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                  </svg>
                  Copy
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}