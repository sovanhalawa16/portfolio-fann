export default function PublicLoading() {
  return (
    <div className="mx-auto max-w-6xl px-6 lg:px-8 py-10 md:py-14">
      {/* HEADER SKELETON */}
      <div className="mb-10 md:mb-14">
        <div className="h-6 w-24 rounded-full bg-neutral-900/60 animate-pulse mb-5" />
        <div className="h-10 md:h-12 w-3/4 max-w-lg rounded-lg bg-neutral-900/60 animate-pulse mb-4" />
        <div className="h-4 w-2/3 max-w-md rounded bg-neutral-900/40 animate-pulse mb-2" />
        <div className="h-4 w-1/2 max-w-sm rounded bg-neutral-900/40 animate-pulse" />
      </div>

      {/* CARDS GRID SKELETON */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-neutral-800 bg-neutral-900/40 overflow-hidden"
          >
            <div className="aspect-[16/10] bg-neutral-900/60 animate-pulse" />
            <div className="p-4 space-y-2">
              <div className="h-3 w-3/4 rounded bg-neutral-900/60 animate-pulse" />
              <div className="h-3 w-1/2 rounded bg-neutral-900/40 animate-pulse" />
              <div className="h-2 w-1/3 rounded bg-neutral-900/30 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}