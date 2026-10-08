"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-lg font-semibold">Произошла ошибка</h1>
      <p className="max-w-md text-sm text-muted">
        Не удалось загрузить данные. Проверьте, что PostgreSQL запущен и
        переменная <code className="font-mono">DATABASE_URL</code> указана верно.
      </p>
      {error.digest ? (
        <p className="font-mono text-xs text-muted">digest: {error.digest}</p>
      ) : null}
      <button type="button" onClick={reset} className="btn btn-primary">
        Повторить
      </button>
    </div>
  );
}
