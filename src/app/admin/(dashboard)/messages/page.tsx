"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";

type Message = {
  id: number;
  name: string;
  email: string;
  subject: string | null;
  body: string;
  status: string;
  created_at: string;
};

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchMessages = async () => {
    setLoading(true);
    const supabase = createClient();
    let query = supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (filterStatus !== "all") {
      query = query.eq("status", filterStatus);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching messages:", error);
      setMessages([]);
    } else {
      setMessages(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
  }, [filterStatus]);

  const handleOpenMessage = async (message: Message) => {
    setSelectedMessage(message);

    // Auto mark as read kalo masih unread
    if (message.status === "unread") {
      const supabase = createClient();
      await supabase
        .from("messages")
        .update({ status: "read" })
        .eq("id", message.id);

      setMessages(
        messages.map((m) =>
          m.id === message.id ? { ...m, status: "read" } : m
        )
      );
      setSelectedMessage({ ...message, status: "read" });
    }
  };

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("messages")
      .update({ status: newStatus })
      .eq("id", id);

    if (!error) {
      setMessages(
        messages.map((m) =>
          m.id === id ? { ...m, status: newStatus } : m
        )
      );
      if (selectedMessage?.id === id) {
        setSelectedMessage({ ...selectedMessage, status: newStatus });
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin mau hapus pesan ini?")) return;
    setDeletingId(id);
    const supabase = createClient();
    const { error } = await supabase.from("messages").delete().eq("id", id);

    if (error) {
      alert("Gagal hapus: " + error.message);
    } else {
      setMessages(messages.filter((m) => m.id !== id));
      if (selectedMessage?.id === id) setSelectedMessage(null);
    }
    setDeletingId(null);
  };

  const handleReply = (message: Message) => {
    const subject = encodeURIComponent(
      `Re: ${message.subject || "Pesan dari website"}`
    );
    const body = encodeURIComponent(
      `\n\n---\nPesan asli dari ${message.name}:\n${message.body}`
    );
    window.open(`mailto:${message.email}?subject=${subject}&body=${body}`);
  };

  const filteredMessages = messages.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      (m.subject?.toLowerCase() || "").includes(search.toLowerCase())
  );

  const statusColors: Record<string, string> = {
    unread: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    read: "bg-neutral-500/10 text-neutral-400 border-neutral-500/20",
    replied: "bg-green-500/10 text-green-400 border-green-500/20",
    archived: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  };

  const statusLabels: Record<string, string> = {
    unread: "🔵 Unread",
    read: "Read",
    replied: "✅ Replied",
    archived: "📦 Archived",
  };

  const filters = [
    { key: "all", label: "All" },
    { key: "unread", label: "Unread" },
    { key: "read", label: "Read" },
    { key: "replied", label: "Replied" },
    { key: "archived", label: "Archived" },
  ];

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m lalu`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}j lalu`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}h lalu`;
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    });
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
        <p className="text-neutral-400 mt-1">
          Pesan dari pengunjung website lo.
        </p>
      </div>

      {/* SEARCH & FILTER */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Cari nama, email, atau subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-neutral-800 bg-neutral-900/40 pl-10 pr-4 py-2.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilterStatus(f.key)}
              className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition ${
                filterStatus === f.key
                  ? "border-violet-500 bg-violet-500/10 text-violet-300"
                  : "border-neutral-800 text-neutral-400 hover:bg-neutral-900"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* LIST */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-neutral-500">
            <div className="inline-block h-8 w-8 border-2 border-neutral-700 border-t-violet-500 rounded-full animate-spin" />
            <p className="mt-4 text-sm">Loading...</p>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="p-16 text-center">
            <div className="text-5xl mb-4">✉️</div>
            <h3 className="text-lg font-semibold mb-2">
              {search ? "Pesan gak ketemu" : "Belum ada pesan"}
            </h3>
            <p className="text-sm text-neutral-400">
              {search
                ? "Coba keyword lain atau reset filter."
                : "Pesan dari contact form bakal muncul di sini."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-800/60">
            {filteredMessages.map((msg) => (
              <button
                key={msg.id}
                onClick={() => handleOpenMessage(msg)}
                className={`w-full text-left p-5 hover:bg-neutral-900/60 transition ${
                  msg.status === "unread" ? "bg-blue-500/5" : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* AVATAR */}
                  <div className="shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-sm font-bold">
                    {msg.name.charAt(0).toUpperCase()}
                  </div>

                  {/* CONTENT */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span
                        className={`text-sm ${
                          msg.status === "unread"
                            ? "font-bold text-white"
                            : "font-medium text-neutral-300"
                        }`}
                      >
                        {msg.name}
                      </span>
                      <span className="text-xs text-neutral-500">
                        {msg.email}
                      </span>
                      <span className="text-xs text-neutral-600">•</span>
                      <span className="text-xs text-neutral-500">
                        {timeAgo(msg.created_at)}
                      </span>
                    </div>

                    <div
                      className={`text-sm truncate mb-1 ${
                        msg.status === "unread"
                          ? "text-white"
                          : "text-neutral-300"
                      }`}
                    >
                      {msg.subject || "(Tanpa subject)"}
                    </div>

                    <div className="text-xs text-neutral-500 line-clamp-1">
                      {msg.body}
                    </div>
                  </div>

                  {/* STATUS */}
                  <div className="shrink-0 flex flex-col items-end gap-2">
                    <span
                      className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize ${
                        statusColors[msg.status] || statusColors.read
                      }`}
                    >
                      {statusLabels[msg.status] || msg.status}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {!loading && filteredMessages.length > 0 && (
        <p className="text-xs text-neutral-500 text-center">
          Menampilkan {filteredMessages.length} pesan
        </p>
      )}

      {/* DETAIL MODAL */}
      {selectedMessage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setSelectedMessage(null)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl border border-neutral-800 bg-neutral-950 shadow-2xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-sm font-bold">
                  {selectedMessage.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold">{selectedMessage.name}</div>
                  <a
                    href={`mailto:${selectedMessage.email}`}
                    className="text-xs text-violet-400 hover:underline"
                  >
                    {selectedMessage.email}
                  </a>
                </div>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="rounded-lg p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* MODAL BODY */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="text-xs text-neutral-500 mb-4">
                {new Date(selectedMessage.created_at).toLocaleString("id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>

              {selectedMessage.subject && (
                <h3 className="text-xl font-bold mb-4">
                  {selectedMessage.subject}
                </h3>
              )}

              <div className="text-sm text-neutral-300 whitespace-pre-wrap leading-relaxed">
                {selectedMessage.body}
              </div>
            </div>

            {/* MODAL FOOTER */}
            <div className="p-6 border-t border-neutral-800 flex flex-wrap gap-2">
              <button
                onClick={() => handleReply(selectedMessage)}
                className="rounded-lg bg-white text-neutral-950 px-4 py-2 text-sm font-semibold hover:bg-neutral-200 transition flex items-center gap-2"
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 17H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2h-4M3 9l4 4-4 4" />
                </svg>
                Reply
              </button>

              {selectedMessage.status !== "replied" && (
                <button
                  onClick={() =>
                    handleUpdateStatus(selectedMessage.id, "replied")
                  }
                  className="rounded-lg border border-green-900/50 text-green-400 px-4 py-2 text-sm font-medium hover:bg-green-950/30 transition"
                >
                  ✅ Tandai Replied
                </button>
              )}

              {selectedMessage.status !== "archived" && (
                <button
                  onClick={() =>
                    handleUpdateStatus(selectedMessage.id, "archived")
                  }
                  className="rounded-lg border border-neutral-800 text-neutral-400 px-4 py-2 text-sm font-medium hover:bg-neutral-900 transition"
                >
                  📦 Archive
                </button>
              )}

              <button
                onClick={() => handleDelete(selectedMessage.id)}
                disabled={deletingId === selectedMessage.id}
                className="ml-auto rounded-lg border border-red-900/50 text-red-400 px-4 py-2 text-sm font-medium hover:bg-red-950/30 transition disabled:opacity-50"
              >
                {deletingId === selectedMessage.id ? "Hapus..." : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}