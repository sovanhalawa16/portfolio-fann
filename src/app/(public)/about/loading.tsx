export default function AboutLoading() {
  return (
    <div className="mx-auto max-w-4xl px-6 lg:px-8 py-10 md:py-14">
      <div className="mb-12 md:mb-16">
        <div className="h-6 w-24 rounded-full bg-neutral-900/60 animate-pulse mb-6" />

        <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 items-start">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-neutral-900/60 animate-pulse" />
          <div className="flex-1 w-full space-y-3">
            <div className="h-8 w-48 rounded bg-neutral-900/60 animate-pulse" />
            <div className="flex gap-2">
              <div className="h-6 w-24 rounded-full bg-neutral-900/40 animate-pulse" />
              <div className="h-6 w-20 rounded-full bg-neutral-900/40 animate-pulse" />
            </div>
            <div className="h-3 w-40 rounded bg-neutral-900/40 animate-pulse" />
          </div>
        </div>
      </div>

      {/* TIMELINE SKELETON */}
      <div className="space-y-4 mb-12">
        <div className="h-6 w-40 rounded bg-neutral-900/60 animate-pulse mb-6" />
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-4"
          >
            <div className="h-4 w-48 rounded bg-neutral-900/60 animate-pulse mb-2" />
            <div className="h-3 w-32 rounded bg-neutral-900/40 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}