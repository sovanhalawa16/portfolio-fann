export default function ChatLoading() {
  return (
    <div className="flex flex-col h-[calc(100vh-96px)] max-h-[900px]">
      <div className="border-b border-neutral-800/60 p-4">
        <div className="h-10 w-64 rounded-full bg-neutral-900/60 animate-pulse" />
      </div>
      <div className="flex-1 p-4 space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-neutral-900/60 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-24 rounded bg-neutral-900/60 animate-pulse" />
              <div className="h-12 w-2/3 rounded-2xl bg-neutral-900/40 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-neutral-800/60 p-4">
        <div className="h-11 rounded-full bg-neutral-900/60 animate-pulse" />
      </div>
    </div>
  );
}