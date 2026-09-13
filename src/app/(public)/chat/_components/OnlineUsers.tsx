"use client";

type OnlineUser = {
  user_id: string;
  user_name: string;
  user_avatar: string | null;
};

export default function OnlineUsers({ users }: { users: OnlineUser[] }) {
  if (users.length === 0) return null;

  return (
    <div className="px-3 md:px-6 py-2 border-b border-neutral-800/60 bg-neutral-950/40">
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
        <span className="shrink-0 inline-flex items-center gap-1.5 text-[10px] font-bold text-green-400 uppercase tracking-wider">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
          </span>
          {users.length} online
        </span>

        <span className="text-neutral-800">·</span>

        <div className="flex items-center gap-1.5">
          {users.slice(0, 8).map((u) => (
            <div
              key={u.user_id}
              className="shrink-0 w-6 h-6 rounded-full overflow-hidden ring-2 ring-neutral-950 bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-[9px] font-bold text-white"
              title={u.user_name}
            >
              {u.user_avatar ? (
                <img
                  src={u.user_avatar}
                  alt={u.user_name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                u.user_name.charAt(0).toUpperCase()
              )}
            </div>
          ))}
          {users.length > 8 && (
            <span className="shrink-0 text-[10px] text-neutral-500">
              +{users.length - 8}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}