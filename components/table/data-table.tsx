"use client";

import { useMemo, useSyncExternalStore, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Dropdown } from "@/components/ui/dropdown";
import { cn } from "@/lib/cn";
import { buildQuery, PER_PAGE_OPTIONS, type SortDir } from "@/lib/list-params";

export type Column = {
  /** Идентификатор колонки; для сортируемых — имя поля в `?sort=`. */
  key: string;
  header: string;
  sortable?: boolean;
  align?: "left" | "right";
  /** Колонка не скрывается (ключевой идентификатор записи). */
  locked?: boolean;
  hiddenByDefault?: boolean;
  className?: string;
};

export type Row = {
  id: string | number;
  /** Содержимое ячеек по ключам колонок, отрисованное на сервере. */
  cells: Record<string, ReactNode>;
};

type DataTableProps = {
  /** Ключ для запоминания скрытых колонок в localStorage. */
  storageKey: string;
  basePath: string;
  params: Record<string, string>;
  columns: readonly Column[];
  rows: readonly Row[];
  total: number;
  page: number;
  perPage: number;
  sort: string;
  dir: SortDir;
  emptyMessage: string;
};

/* ---------------------------------------------------------------------------
 * Набор скрытых колонок живёт в localStorage и читается через
 * useSyncExternalStore: на сервере хранилища нет, поэтому серверный снимок
 * всегда `null`, а React сам выполняет повторный рендер после гидратации.
 * ------------------------------------------------------------------------ */

const listeners = new Set<() => void>();
/** Кеш разобранных значений: getSnapshot обязан возвращать стабильную ссылку. */
const snapshots = new Map<string, { raw: string | null; value: string[] | null }>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  // Событие storage приходит, когда набор изменили в другой вкладке.
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function readHidden(key: string): string[] | null {
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(key);
  } catch {
    return null; // приватный режим браузера
  }

  const cached = snapshots.get(key);
  if (cached && cached.raw === raw) return cached.value;

  let value: string[] | null = null;
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    if (Array.isArray(parsed)) {
      value = parsed.filter((item): item is string => typeof item === "string");
    }
  } catch {
    value = null;
  }

  snapshots.set(key, { raw, value });
  return value;
}

function writeHidden(key: string, value: string[]) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Не удалось сохранить — набор применится только к текущей сессии.
  }
  for (const listener of listeners) listener();
}

export function DataTable({
  storageKey,
  basePath,
  params,
  columns,
  rows,
  total,
  page,
  perPage,
  sort,
  dir,
  emptyMessage,
}: DataTableProps) {
  const storeKey = `cols:${storageKey}`;

  const stored = useSyncExternalStore(
    subscribe,
    () => readHidden(storeKey),
    () => null,
  );

  const defaults = useMemo(
    () => columns.filter((column) => column.hiddenByDefault).map((column) => column.key),
    [columns],
  );

  const hidden = stored ?? defaults;

  function toggleColumn(key: string) {
    writeHidden(
      storeKey,
      hidden.includes(key) ? hidden.filter((value) => value !== key) : [...hidden, key],
    );
  }

  const visible = useMemo(
    () => columns.filter((column) => column.locked || !hidden.includes(column.key)),
    [columns, hidden],
  );

  const href = (patch: Record<string, string | number | undefined>) =>
    `${basePath}${buildQuery(params, patch)}`;

  const pageCount = Math.max(1, Math.ceil(total / perPage));
  const from = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-2.5">
        <p className="text-sm text-muted">
          {total === 0 ? (
            "Записи не найдены"
          ) : (
            <>
              Показаны <span className="font-medium text-ink">{from}–{to}</span> из{" "}
              <span className="font-medium text-ink">{total}</span>
            </>
          )}
        </p>

        <Dropdown align="right" label="Колонки">
          {() => (
            <div className="py-1">
              {columns.map((column) => {
                const checked = column.locked || !hidden.includes(column.key);
                return (
                  <label
                    key={column.key}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-1.5 text-sm",
                      column.locked
                        ? "cursor-not-allowed text-muted"
                        : "cursor-pointer text-ink hover:bg-canvas",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={column.locked}
                      onChange={() => toggleColumn(column.key)}
                      className="size-4 accent-accent"
                    />
                    {column.header}
                  </label>
                );
              })}
            </div>
          )}
        </Dropdown>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-line bg-canvas/60">
              {visible.map((column) => {
                const active = sort === column.key;
                const nextDir: SortDir = active && dir === "asc" ? "desc" : "asc";

                return (
                  <th
                    key={column.key}
                    scope="col"
                    aria-sort={
                      active
                        ? dir === "asc"
                          ? "ascending"
                          : "descending"
                        : undefined
                    }
                    className={cn(
                      "px-4 py-2.5 text-xs font-semibold tracking-wide text-muted uppercase",
                      column.align === "right" ? "text-right" : "text-left",
                      column.className,
                    )}
                  >
                    {column.sortable ? (
                      <Link
                        href={href({ sort: column.key, dir: nextDir, page: undefined })}
                        className={cn(
                          "inline-flex items-center gap-1 transition-colors hover:text-ink",
                          active && "text-accent",
                        )}
                      >
                        {column.header}
                        <span aria-hidden className="text-[10px]">
                          {active ? (dir === "asc" ? "▲" : "▼") : "↕"}
                        </span>
                      </Link>
                    ) : (
                      column.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={visible.length}
                  className="px-4 py-12 text-center text-sm text-muted"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-line last:border-b-0 hover:bg-canvas/70"
                >
                  {visible.map((column) => (
                    <td
                      key={column.key}
                      className={cn(
                        "px-4 py-2.5 align-top",
                        column.align === "right" && "text-right tabular-nums",
                        column.className,
                      )}
                    >
                      {row.cells[column.key] ?? null}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-2.5">
        <label className="flex items-center gap-2 text-sm text-muted">
          Строк на странице
          <PerPageSelect basePath={basePath} params={params} perPage={perPage} />
        </label>

        <div className="flex items-center gap-1">
          <PageLink href={href({ page: 1 })} disabled={page <= 1} label="В начало">
            «
          </PageLink>
          <PageLink
            href={href({ page: page - 1 })}
            disabled={page <= 1}
            label="Предыдущая страница"
          >
            ‹
          </PageLink>

          <span className="px-2 text-sm text-muted">
            Стр. <span className="font-medium text-ink">{Math.min(page, pageCount)}</span>{" "}
            из <span className="font-medium text-ink">{pageCount}</span>
          </span>

          <PageLink
            href={href({ page: page + 1 })}
            disabled={page >= pageCount}
            label="Следующая страница"
          >
            ›
          </PageLink>
          <PageLink
            href={href({ page: pageCount })}
            disabled={page >= pageCount}
            label="В конец"
          >
            »
          </PageLink>
        </div>
      </div>
    </div>
  );
}

function PageLink({
  href,
  disabled,
  label,
  children,
}: {
  href: string;
  disabled: boolean;
  label: string;
  children: ReactNode;
}) {
  const className =
    "grid size-8 place-items-center rounded border border-line text-sm transition-colors";

  if (disabled) {
    return (
      <span
        aria-disabled
        aria-label={label}
        className={cn(className, "cursor-not-allowed bg-canvas text-line")}
      >
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      aria-label={label}
      className={cn(className, "bg-surface text-ink hover:bg-canvas")}
    >
      {children}
    </Link>
  );
}

function PerPageSelect({
  basePath,
  params,
  perPage,
}: {
  basePath: string;
  params: Record<string, string>;
  perPage: number;
}) {
  const router = useRouter();

  return (
    <select
      value={perPage}
      onChange={(event) => {
        // Смена размера страницы сбрасывает номер страницы.
        const query = buildQuery(params, {
          per: event.target.value,
          page: undefined,
        });
        router.push(`${basePath}${query}`);
      }}
      className="field w-auto py-1"
    >
      {PER_PAGE_OPTIONS.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}
