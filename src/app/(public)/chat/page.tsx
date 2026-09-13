import { createClient } from "@/lib/supabase-server";
import ChatShell from "./_components/ChatShell";

export const metadata = {
  title: "Chat",
  description:
    "Live chatroom dan AI assistant. Ngobrol sama pengunjung lain atau tanya AI.",
};

export const revalidate = 0;

export default async function ChatPage() {
  const supabase = await createClient();

  const { data: settings } = await supabase
    .from("chat_settings")
    .select("key, value")
    .in("key", ["chatroom_enabled", "ai_enabled"]);

  const config = (settings || []).reduce<Record<string, string>>(
    (acc, s) => ({ ...acc, [s.key]: s.value }),
    {}
  );

  return (
    <ChatShell
      chatroomEnabled={config.chatroom_enabled !== "false"}
      aiEnabled={config.ai_enabled !== "false"}
    />
  );
}