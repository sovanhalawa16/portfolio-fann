export default function PublicationsLoading() {
  return (
    <div className="mx-auto max-w-5xl px-6 lg:px-8 py-10 md:py-14">
      {/* HEADER */}
      <div className="mb-10 md:mb-12">
        <div className="h-6 w-40 rounded-full bg-neutral-900/60 animate-pulse mb-5" />
        <div className="h-10 md:h-12 w-2/3 max-w-md rounded-lg bg-neutral-900/60 animate-pulse mb-4" />
        <div className="h-4 w-full max-w-2xl rounded bg-neutral-900/40 animate-pulse mb-2" />
      </div>

      {/* METRICS SKELETON */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 mb-10">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-neutral-900/60 animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 w-32 rounded bg-neutral-900/60 animate-pulse" />
            <div className="h-3 w-24 rounded bg-neutral-900/40 animate-pulse" />
          </div>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-3 border-b border-neutral-800/40 last:border-0"
            >
              <div className="h-3 w-24 rounded bg-neutral-900/40 animate-pulse" />
              <div className="flex gap-8">
                <div className="h-3 w-10 rounded bg-neutral-900/60 animate-pulse" />
                <div className="h-3 w-10 rounded bg-neutral-900/60 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PUBLICATIONS SKELETON */}
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-5"
          >
            <div className="flex gap-2 mb-3">
              <div className="h-5 w-20 rounded-full bg-neutral-900/60 animate-pulse" />
              <div className="h-5 w-16 rounded-full bg-neutral-900/60 animate-pulse" />
            </div>
            <div className="h-5 w-4/5 rounded bg-neutral-900/60 animate-pulse mb-2" />
            <div className="h-3 w-3/5 rounded bg-neutral-900/40 animate-pulse mb-3" />
            <div className="h-3 w-full rounded bg-neutral-900/40 animate-pulse mb-1.5" />
            <div className="h-3 w-2/3 rounded bg-neutral-900/40 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}