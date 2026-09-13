"use client";

import { useState } from "react";
import TabSwitcher from "./TabSwitcher";
import AIChat from "./AIChat";
import LiveChat from "./LiveChat";

type Props = {
  chatroomEnabled: boolean;
  aiEnabled: boolean;
};

type Mode = "chatroom" | "ai";

export default function ChatShell({ chatroomEnabled, aiEnabled }: Props) {
  const [mode, setMode] = useState<Mode>(
    chatroomEnabled ? "chatroom" : aiEnabled ? "ai" : "chatroom"
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col h-full lg:max-w-5xl lg:mx-auto lg:w-full lg:px-6">
        <div className="flex flex-col h-full lg:rounded-b-2xl border-0 lg:border lg:border-t-0 border-neutral-800 bg-neutral-950 lg:bg-neutral-900/40 overflow-hidden">
          <TabSwitcher
            mode={mode}
            onModeChange={setMode}
            chatroomEnabled={chatroomEnabled}
            aiEnabled={aiEnabled}
          />

          <div className="flex-1 overflow-hidden">
            {mode === "ai" && aiEnabled && <AIChat />}
            {mode === "chatroom" && chatroomEnabled && <LiveChat />}
          </div>
        </div>
      </div>
    </div>
  );
}