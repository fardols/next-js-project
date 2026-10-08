export type SortDir = "asc" | "desc";

export type SearchParams = Record<string, string | string[] | undefined>;

export const PER_PAGE_OPTIONS = [10, 25, 50, 100] as const;

const DEFAULT_PER_PAGE = 25;

/** Первое значение параметра как строка (`?a=1&a=2` → `"1"`). */
export function one(params: SearchParams, key: string): string {
  const value = params[key];
  const raw = Array.isArray(value) ? value[0] : value;
  return typeof raw === "string" ? raw.trim() : "";
}

export type ListParams<TSort extends string> = {
  page: number;
  perPage: number;
  sort: TSort;
  dir: SortDir;
};

/**
 * Разбирает параметры постраничного вывода и сортировки.
 * Поле сортировки сверяется с белым списком — значение подставляется
 * в SQL как имя колонки, поэтому произвольный ввод недопустим.
 */
export function parseListParams<TSort extends string>(
  params: SearchParams,
  sortable: readonly TSort[],
  defaultSort: TSort,
  defaultDir: SortDir = "asc",
): ListParams<TSort> {
  const rawSort = one(params, "sort") as TSort;
  const rawDir = one(params, "dir");

  const page = Number.parseInt(one(params, "page"), 10);
  const perPage = Number.parseInt(one(params, "per"), 10);

  return {
    page: Number.isFinite(page) && page > 0 ? page : 1,
    perPage: (PER_PAGE_OPTIONS as readonly number[]).includes(perPage)
      ? perPage
      : DEFAULT_PER_PAGE,
    sort: sortable.includes(rawSort) ? rawSort : defaultSort,
    dir: rawDir === "asc" || rawDir === "desc" ? rawDir : defaultDir,
  };
}

/** Сводит `searchParams` к плоскому объекту строк для передачи в Client Component. */
export function flattenParams(params: SearchParams): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    const raw = Array.isArray(value) ? value[0] : value;
    if (typeof raw === "string" && raw !== "") result[key] = raw;
  }
  return result;
}

/** Строит query-строку: `undefined`/`""` удаляют параметр. */
export function buildQuery(
  current: Record<string, string>,
  patch: Record<string, string | number | undefined>,
): string {
  const next = new URLSearchParams(current);
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined || value === "") next.delete(key);
    else next.set(key, String(value));
  }
  const query = next.toString();
  return query ? `?${query}` : "";
}
