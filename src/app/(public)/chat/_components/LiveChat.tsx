"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { useUser } from "@/hooks/useUser";
import LiveMessageBubble from "./LiveMessageBubble";
import OnlineUsers from "./OnlineUsers";
import LoginModal from "./LoginModal";
import MessageInput from "./MessageInput";
import DateDivider, { shouldShowDateDivider } from "./DateDivider";

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
  reply_to?: { id: number; user_name: string; content: string } | null;
};

type Reaction = {
  id: number;
  message_id: number;
  user_id: string;
  user_name: string;
  emoji: string;
};

type ReactionGroup = {
  emoji: string;
  count: number;
  users: string[];
  hasReacted: boolean;
};

type OnlineUser = {
  user_id: string;
  user_name: string;
  user_avatar: string | null;
};

type ReplyTarget = {
  id: number;
  user_name: string;
  content: string;
} | null;

const ROOM_ID = "general";

export default function LiveChat() {
  const { user, loading: userLoading, signOut } = useUser();
  const router = useRouter();
  const [messages, setMessages] = useState<LiveMessage[]>([]);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [replyTarget, setReplyTarget] = useState<ReplyTarget>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch initial
  useEffect(() => {
    if (!mounted) return;

    const fetchData = async () => {
      const supabase = createClient();

      const [msgRes, reactRes] = await Promise.all([
        supabase
          .from("chat_messages")
          .select("*")
          .eq("room_id", ROOM_ID)
          .is("deleted_at", null)
          .order("created_at", { ascending: true })
          .limit(100),
        supabase.from("chat_reactions").select("*"),
      ]);

      if (msgRes.data) {
        // Attach reply_to preview
        const msgs = msgRes.data as LiveMessage[];
        const enriched = msgs.map((m) => {
          if (m.reply_to_id) {
            const target = msgs.find((x) => x.id === m.reply_to_id);
            return {
              ...m,
              reply_to: target
                ? {
                    id: target.id,
                    user_name: target.user_name,
                    content: target.content,
                  }
                : null,
            };
          }
          return m;
        });
        setMessages(enriched);
      }
      if (reactRes.data) setReactions(reactRes.data);
      setLoading(false);
    };

    fetchData();
  }, [mounted]);

  // Realtime
  useEffect(() => {
    if (!mounted) return;

    const supabase = createClient();
    const channel = supabase
      .channel("chat_realtime_v2", {
        config: { presence: { key: user?.id || `guest_${Math.random().toString(36).slice(2, 9)}` } },
      })
      // NEW MESSAGE
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `room_id=eq.${ROOM_ID}`,
        },
        (payload) => {
          const newMsg = payload.new as LiveMessage;
          if (newMsg.deleted_at) return;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            // Attach reply_to kalo ada
            if (newMsg.reply_to_id) {
              const target = prev.find((x) => x.id === newMsg.reply_to_id);
              if (target) {
                newMsg.reply_to = {
                  id: target.id,
                  user_name: target.user_name,
                  content: target.content,
                };
              }
            }
            return [...prev, newMsg];
          });
        }
      )
      // UPDATE (edit / soft delete)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "chat_messages",
          filter: `room_id=eq.${ROOM_ID}`,
        },
        (payload) => {
          const updated = payload.new as LiveMessage;
          if (updated.deleted_at) {
            setMessages((prev) => prev.filter((m) => m.id !== updated.id));
          } else {
            setMessages((prev) =>
              prev.map((m) => {
                if (m.id === updated.id) {
                  // Preserve reply_to preview
                  return { ...updated, reply_to: m.reply_to };
                }
                return m;
              })
            );
          }
        }
      )
      // REACTIONS
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_reactions" },
        (payload) => {
          setReactions((prev) => {
            if (prev.some((r) => r.id === (payload.new as Reaction).id))
              return prev;
            return [...prev, payload.new as Reaction];
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "chat_reactions" },
        (payload) => {
          setReactions((prev) =>
            prev.filter((r) => r.id !== (payload.old as Reaction).id)
          );
        }
      )
      // PRESENCE
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const users: OnlineUser[] = Object.values(state)
          .flat()
          .map((u: any) => ({
            user_id: u.user_id,
            user_name: u.user_name,
            user_avatar: u.user_avatar,
          }))
          .filter(
            (u, i, self) => self.findIndex((x) => x.user_id === u.user_id) === i
          );
        setOnlineUsers(users);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            user_id: user?.id || `guest_${Math.random().toString(36).slice(2, 9)}`,
            user_name:
              user?.user_metadata?.full_name ||
              user?.user_metadata?.name ||
              user?.email?.split("@")[0] ||
              "Guest",
            user_avatar:
              user?.user_metadata?.avatar_url ||
              user?.user_metadata?.picture ||
              null,
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [mounted, user]);

  useEffect(() => {
    if (autoScrollRef.current && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    autoScrollRef.current = scrollHeight - scrollTop - clientHeight < 80;
  };

  const handleSend = async (content: string) => {
    if (!user) {
      setLoginModalOpen(true);
      return;
    }
    if (!content.trim() || isSending) return;

    setIsSending(true);
    autoScrollRef.current = true;

    const supabase = createClient();
    const { error } = await supabase.from("chat_messages").insert({
      user_id: user.id,
      user_name:
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split("@")[0] ||
        "Anonymous",
      user_avatar:
        user.user_metadata?.avatar_url ||
        user.user_metadata?.picture ||
        null,
      content: content.trim(),
      message_type: "text",
      room_id: ROOM_ID,
      reply_to_id: replyTarget?.id || null,
    });

    if (error) {
      alert("Gagal kirim: " + error.message);
    } else {
      setReplyTarget(null);
    }

    setIsSending(false);
  };

  const handleDelete = async (id: number) => {
    const supabase = createClient();
    const { error } = await supabase.rpc("delete_chat_message", {
      message_id: id,
    });
    if (error) {
      alert("Gagal hapus: " + error.message);
    } else {
      setMessages((prev) => prev.filter((m) => m.id !== id));
    }
  };

  const handleEdit = async (id: number, newContent: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("chat_messages")
      .update({ content: newContent, edited_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      alert("Gagal edit: " + error.message);
    } else {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === id
            ? { ...m, content: newContent, edited_at: new Date().toISOString() }
            : m
        )
      );
    }
  };

  const handleReply = (message: LiveMessage) => {
    setReplyTarget({
      id: message.id,
      user_name: message.user_name,
      content: message.content,
    });
  };

  const handleReact = async (messageId: number, emoji: string) => {
    if (!user) {
      setLoginModalOpen(true);
      return;
    }
    const supabase = createClient();
    const { error } = await supabase.rpc("toggle_chat_reaction", {
      p_message_id: messageId,
      p_emoji: emoji,
    });
    if (error) {
      console.error("Reaction error:", error);
      alert("Gagal react: " + error.message);
    }
  };

  // Group reactions per message
  const getReactionsForMessage = (messageId: number): ReactionGroup[] => {
    const msgReactions = reactions.filter((r) => r.message_id === messageId);
    const grouped = new Map<string, ReactionGroup>();

    msgReactions.forEach((r) => {
      const existing = grouped.get(r.emoji);
      if (existing) {
        existing.count++;
        existing.users.push(r.user_name);
        if (user && r.user_id === user.id) existing.hasReacted = true;
      } else {
        grouped.set(r.emoji, {
          emoji: r.emoji,
          count: 1,
          users: [r.user_name],
          hasReacted: user ? r.user_id === user.id : false,
        });
      }
    });

    return Array.from(grouped.values()).sort((a, b) => b.count - a.count);
  };

  if (!mounted || userLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="inline-block h-6 w-6 border-2 border-neutral-800 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* HEADER */}
      <div className="border-b border-neutral-800/60 bg-neutral-950/60 backdrop-blur-xl px-3 md:px-6 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button
              onClick={() => router.push("/")}
              className="lg:hidden shrink-0 w-9 h-9 rounded-lg border border-neutral-800 bg-neutral-900/60 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-900 transition"
              aria-label="Kembali"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="min-w-0">
              <h2 className="text-sm md:text-base font-bold tracking-tight truncate">
                Ayo Ngobrol Real-time 💬
              </h2>
              <p className="text-[10px] md:text-xs text-neutral-500 truncate">
                Obrolan santai bareng pengunjung lain
              </p>
            </div>
          </div>

          {user && (
            <button
              onClick={signOut}
              className="shrink-0 rounded-lg border border-neutral-800 px-2.5 py-1.5 text-[10px] text-neutral-500 hover:text-red-400 hover:border-red-900/50 transition"
            >
              Logout
            </button>
          )}
        </div>
      </div>

      <OnlineUsers users={onlineUsers} />

      {/* MESSAGES */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-3 md:px-6 py-4 scroll-smooth"
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="inline-block h-6 w-6 border-2 border-neutral-800 border-t-violet-500 rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-16 h-16 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-500 mb-4">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold mb-1">Belum ada pesan</h3>
            <p className="text-sm text-neutral-500">Mulai percakapan pertama!</p>
          </div>
        ) : (
          <div className="space-y-3 max-w-3xl mx-auto">
            {messages.map((msg, i) => {
              const prevMsg = i > 0 ? messages[i - 1] : null;
              const showDivider = shouldShowDateDivider(
                msg.created_at,
                prevMsg?.created_at ?? null
              );

              return (
                <div key={msg.id}>
                  {showDivider && <DateDivider date={msg.created_at} />}
                  <LiveMessageBubble
                    message={msg}
                    isOwnMessage={user?.id === msg.user_id}
                    reactions={getReactionsForMessage(msg.id)}
                    onDelete={user?.id === msg.user_id ? handleDelete : undefined}
                    onEdit={user?.id === msg.user_id ? handleEdit : undefined}
                    onReply={user ? handleReply : undefined}
                    onReact={user ? handleReact : undefined}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* REPLY PREVIEW BAR */}
      {replyTarget && (
        <div className="border-t border-neutral-800/60 bg-neutral-900/60 backdrop-blur-xl px-3 md:px-6 py-2">
          <div className="max-w-3xl mx-auto flex items-center gap-3">
            <div className="shrink-0 w-1 h-8 rounded-full bg-violet-500" />
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold text-violet-400 mb-0.5">
                Membalas {replyTarget.user_name}
              </div>
              <div className="text-xs text-neutral-500 truncate">
                {replyTarget.content}
              </div>
            </div>
            <button
              onClick={() => setReplyTarget(null)}
              className="shrink-0 rounded-lg p-1.5 text-neutral-500 hover:text-white hover:bg-neutral-800 transition"
              aria-label="Batal reply"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* INPUT */}
      {user ? (
        <MessageInput
          onSend={handleSend}
          disabled={isSending}
          placeholder={`Ketik pesan sebagai ${
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email?.split("@")[0]
          }...`}
        />
      ) : (
        <div className="border-t border-neutral-800/60 bg-neutral-950/80 backdrop-blur-xl p-3 md:p-4">
          <div className="max-w-3xl mx-auto">
            <button
              onClick={() => setLoginModalOpen(true)}
              className="w-full rounded-2xl border border-neutral-800 bg-neutral-900/60 hover:bg-neutral-900 hover:border-violet-500/40 px-4 py-3 text-sm text-neutral-500 hover:text-white transition flex items-center justify-center gap-2"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" />
              </svg>
              <span>Login buat ikut ngobrol di live chat →</span>
            </button>
          </div>
        </div>
      )}

      <LoginModal open={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
    </div>
  );
}