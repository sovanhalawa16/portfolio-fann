"use client";

import { useEffect, useRef, useState } from "react";
import WelcomeAI from "./WelcomeAI";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
  isStreaming?: boolean;
  isThinking?: boolean;
};

const STORAGE_KEY = "fann-ai-session-id";
const MESSAGES_KEY = "fann-ai-messages";

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [mounted, setMounted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef(true);

  useEffect(() => {
    setMounted(true);
    let sid = localStorage.getItem(STORAGE_KEY);
    if (!sid) {
      sid = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      localStorage.setItem(STORAGE_KEY, sid);
    }
    setSessionId(sid);

    try {
      const saved = localStorage.getItem(MESSAGES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Reset streaming flags dari session sebelumnya
          setMessages(
            parsed.map((m: any) => ({
              ...m,
              isStreaming: false,
              isThinking: false,
            }))
          );
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages.slice(-50)));
    }
  }, [messages, mounted]);

  // Auto-scroll cerdas
  useEffect(() => {
    if (autoScrollRef.current && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    // Kalo user scroll ke bawah dikit (dalam 60px), aktifin auto-scroll
    autoScrollRef.current = scrollHeight - scrollTop - clientHeight < 60;
  };

  const handleSend = async (content: string) => {
    if (!content.trim() || isLoading) return;

    autoScrollRef.current = true;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: "user",
      content: content.trim(),
      created_at: new Date().toISOString(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    const aiMessageId = `ai_${Date.now()}`;
    // FASE 1: Thinking
    setMessages((prev) => [
      ...prev,
      {
        id: aiMessageId,
        role: "assistant",
        content: "",
        created_at: new Date().toISOString(),
        isThinking: true,
      },
    ]);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages
            .filter((m) => !m.isStreaming && !m.isThinking)
            .map((m) => ({ role: m.role, content: m.content })),
          sessionId,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        let errorMsg = `HTTP ${response.status}`;
        try {
          const parsed = JSON.parse(errorText);
          if (parsed.error) errorMsg += ` · ${parsed.error}`;
          if (parsed.hint) errorMsg += ` — ${parsed.hint}`;
        } catch {
          errorMsg += ` · ${errorText.slice(0, 150)}`;
        }
        throw new Error(errorMsg);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";
      let hasStarted = false;

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          if (!chunk) continue;

          accumulated += chunk;

          // FASE 2: Streaming — hapus thinking begitu ada chunk pertama
          if (!hasStarted) {
            hasStarted = true;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === aiMessageId
                  ? { ...m, content: accumulated, isThinking: false, isStreaming: true }
                  : m
              )
            );
          } else {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === aiMessageId ? { ...m, content: accumulated } : m
              )
            );
          }
        }
      }

      if (!accumulated.trim()) {
        throw new Error("AI gak ngasih response. Coba lagi.");
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMessageId
            ? { ...m, isStreaming: false, isThinking: false }
            : m
        )
      );
    } catch (err: any) {
      console.error("AI ERROR:", err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMessageId
            ? {
                ...m,
                content: `❌ ${err?.message || "AI error. Coba lagi."}`,
                isStreaming: false,
                isThinking: false,
              }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    if (!confirm("Hapus semua percakapan?")) return;
    setMessages([]);
    localStorage.removeItem(MESSAGES_KEY);
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col h-full">
      {/* MESSAGES */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-3 md:px-6 py-4 scroll-smooth"
      >
        {messages.length === 0 ? (
          <WelcomeAI onPromptClick={handleSend} />
        ) : (
          <div className="space-y-4 max-w-3xl mx-auto">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} isAI />
            ))}
          </div>
        )}
      </div>

      {/* CLEAR BUTTON */}
      {messages.length > 0 && (
        <div className="px-3 md:px-6 pb-2 flex justify-center">
          <button
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 rounded-full border border-neutral-800 bg-neutral-900/60 hover:bg-neutral-900 px-3 py-1 text-[10px] text-neutral-500 hover:text-white transition"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-3 h-3"
            >
              <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
            </svg>
            Hapus Percakapan
          </button>
        </div>
      )}

      {/* INPUT */}
      <MessageInput
        onSend={handleSend}
        disabled={isLoading}
        placeholder="Tanya apa aja ke Fann AI..."
      />
    </div>
  );
}