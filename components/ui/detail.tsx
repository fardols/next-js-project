import type { ReactNode } from "react";

/** Карточка-описание: сетка «подпись → значение». */
export function DetailList({ children }: { children: ReactNode }) {
  return (
    <dl className="card divide-y divide-line">{children}</dl>
  );
}

export function DetailRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-1 px-5 py-3 sm:grid-cols-[220px_1fr] sm:gap-4">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="text-sm text-ink">{children}</dd>
    </div>
  );
}

/** Заглушка карточки на время загрузки внутри <Suspense>. */
export function DetailSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div aria-hidden>
      <div className="mb-5 h-12 w-72 animate-pulse rounded bg-line/60" />
      <div className="card divide-y divide-line">
        {Array.from({ length: rows }, (_, index) => (
          <div key={index} className="grid gap-4 px-5 py-3 sm:grid-cols-[220px_1fr]">
            <span className="h-4 w-32 animate-pulse rounded bg-line" />
            <span className="h-4 w-56 animate-pulse rounded bg-line" />
          </div>
        ))}
      </div>
    </div>
  );
}
