export default function ProjectsLoading() {
  return (
    <div className="mx-auto max-w-6xl px-6 lg:px-8 py-12 md:py-16">
      <div className="mb-10 md:mb-14">
        <div className="h-6 w-24 rounded-full bg-neutral-900/60 animate-pulse mb-5" />
        <div className="h-10 md:h-12 w-2/3 max-w-md rounded-lg bg-neutral-900/60 animate-pulse mb-4" />
        <div className="h-4 w-full max-w-2xl rounded bg-neutral-900/40 animate-pulse mb-2" />
        <div className="h-4 w-3/4 max-w-lg rounded bg-neutral-900/40 animate-pulse" />
      </div>

      <div className="flex gap-3 mb-5">
        <div className="flex-1 h-11 rounded-xl bg-neutral-900/40 animate-pulse" />
        <div className="w-32 h-11 rounded-xl bg-neutral-900/40 animate-pulse" />
      </div>

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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}