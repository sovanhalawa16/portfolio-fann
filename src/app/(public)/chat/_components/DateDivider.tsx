"use client";

export function formatDateDivider(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();

  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.getTime() === today.getTime()) return "Hari Ini";
  if (d.getTime() === yesterday.getTime()) return "Kemarin";

  const diffDays = Math.floor(
    (today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays < 7) {
    return date.toLocaleDateString("id-ID", { weekday: "long" });
  }

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year:
      date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

export function shouldShowDateDivider(
  current: string,
  previous: string | null
): boolean {
  if (!previous) return true;
  const d1 = new Date(current);
  const d2 = new Date(previous);
  return (
    d1.getFullYear() !== d2.getFullYear() ||
    d1.getMonth() !== d2.getMonth() ||
    d1.getDate() !== d2.getDate()
  );
}

export default function DateDivider({ date }: { date: string }) {
  return (
    <div className="flex items-center justify-center my-4">
      <div className="inline-flex items-center rounded-full bg-neutral-900/80 border border-neutral-800 px-3 py-1 text-[10px] font-medium text-neutral-400 backdrop-blur">
        {formatDateDivider(date)}
      </div>
    </div>
  );
}