export default function ContactLoading() {
  return (
    <div className="mx-auto max-w-5xl px-6 lg:px-8 py-10 md:py-14">
      <div className="mb-10 md:mb-12">
        <div className="h-6 w-24 rounded-full bg-neutral-900/60 animate-pulse mb-5" />
        <div className="h-10 md:h-12 w-2/3 max-w-md rounded-lg bg-neutral-900/60 animate-pulse mb-4" />
        <div className="h-4 w-full max-w-2xl rounded bg-neutral-900/40 animate-pulse" />
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* FORM SKELETON */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-4">
          <div className="h-5 w-32 rounded bg-neutral-900/60 animate-pulse mb-2" />
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="h-11 rounded-lg bg-neutral-900/60 animate-pulse" />
            <div className="h-11 rounded-lg bg-neutral-900/60 animate-pulse" />
          </div>
          <div className="h-11 rounded-lg bg-neutral-900/60 animate-pulse" />
          <div className="h-32 rounded-lg bg-neutral-900/60 animate-pulse" />
          <div className="h-12 rounded-lg bg-neutral-900/60 animate-pulse" />
        </div>

        {/* SIDEBAR SKELETON */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 space-y-3">
            <div className="h-4 w-24 rounded bg-neutral-900/60 animate-pulse" />
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-9 h-9 rounded-lg bg-neutral-900/60 animate-pulse" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-2 w-12 rounded bg-neutral-900/40 animate-pulse" />
                  <div className="h-3 w-32 rounded bg-neutral-900/60 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}