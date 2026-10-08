"use client";

import { useRouter } from "next/navigation";
import { useTransition, type FormEvent, type ReactNode } from "react";

import { cn } from "@/lib/cn";

type FilterBarProps = {
  basePath: string;
  /** Текущие параметры URL — сохраняются сортировка и размер страницы. */
  params: Record<string, string>;
  /** Имена полей фильтра: очищаются при сбросе. */
  fields: readonly string[];
  children: ReactNode;
};

/**
 * Панель фильтров. Поля неконтролируемые — значения читаются из FormData
 * при отправке, поэтому состояние не расходится с URL после навигации
 * «назад» (Cache Components сохраняет смонтированные маршруты).
 */
export function FilterBar({ basePath, params, fields, children }: FilterBarProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const hasFilters = fields.some((field) => params[field]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const next = new URLSearchParams(params);
    const formData = new FormData(event.currentTarget);

    for (const field of fields) {
      const value = formData.get(field);
      const text = typeof value === "string" ? value.trim() : "";
      if (text) next.set(field, text);
      else next.delete(field);
    }
    next.delete("page"); // новый фильтр — снова первая страница

    const query = next.toString();
    startTransition(() => router.push(`${basePath}${query ? `?${query}` : ""}`));
  }

  function onReset() {
    const next = new URLSearchParams(params);
    for (const field of fields) next.delete(field);
    next.delete("page");

    const query = next.toString();
    startTransition(() => router.push(`${basePath}${query ? `?${query}` : ""}`));
  }

  return (
    <form
      onSubmit={onSubmit}
      className={cn("card mb-4 p-4 transition-opacity", pending && "opacity-60")}
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{children}</div>

      <div className="mt-3 flex items-center gap-2">
        <button type="submit" className="btn btn-primary" disabled={pending}>
          Применить
        </button>
        <button
          type="button"
          onClick={onReset}
          className="btn btn-secondary"
          disabled={pending || !hasFilters}
        >
          Сбросить
        </button>
      </div>
    </form>
  );
}
