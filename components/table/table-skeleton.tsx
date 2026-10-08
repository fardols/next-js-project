/** Заглушка списка на время загрузки данных внутри <Suspense>. */
export function TableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="space-y-4" aria-hidden>
      <div className="card h-[72px] animate-pulse" />
      <div className="card divide-y divide-line overflow-hidden">
        <div className="h-11 animate-pulse bg-canvas" />
        {Array.from({ length: rows }, (_, index) => (
          <div key={index} className="flex h-11 items-center gap-4 px-4">
            <span className="h-3 w-full max-w-[22%] animate-pulse rounded bg-line" />
            <span className="h-3 w-full max-w-[34%] animate-pulse rounded bg-line" />
            <span className="h-3 w-full max-w-[18%] animate-pulse rounded bg-line" />
          </div>
        ))}
        <div className="h-11 animate-pulse bg-canvas" />
      </div>
    </div>
  );
}
