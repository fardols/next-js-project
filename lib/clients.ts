import "server-only";

import { requireUser } from "./auth";
import { query, queryOne } from "./db";
import type { SortDir } from "./list-params";

export type Client = {
  id: number;
  name: string;
  code: string;
  created_at: string;
  updated_at: string;
  /** Количество связанных сделок — нужно для блокировки удаления. */
  deals_count: number;
};

export const CLIENT_SORT_FIELDS = [
  "id",
  "name",
  "code",
  "deals_count",
  "created_at",
] as const;
export type ClientSortField = (typeof CLIENT_SORT_FIELDS)[number];

// Сопоставление допустимых полей сортировки с SQL-выражениями.
// Имя колонки нельзя передать параметром запроса, поэтому берём его
// только из этой таблицы, а не из пользовательского ввода.
const SORT_SQL: Record<ClientSortField, string> = {
  id: "c.id",
  name: "c.name",
  code: "c.code",
  deals_count: "deals_count",
  created_at: "c.created_at",
};

export type ClientFilters = {
  name: string;
  code: string;
};

export type ClientListQuery = ClientFilters & {
  page: number;
  perPage: number;
  sort: ClientSortField;
  dir: SortDir;
};

/** Условия WHERE и их параметры, общие для списка и подсчёта. */
function buildWhere(filters: ClientFilters) {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (filters.name) {
    params.push(`%${filters.name}%`);
    conditions.push(`c.name ILIKE $${params.length}`);
  }
  if (filters.code) {
    params.push(`%${filters.code}%`);
    conditions.push(`c.code ILIKE $${params.length}`);
  }

  return {
    sql: conditions.length ? `WHERE ${conditions.join(" AND ")}` : "",
    params,
  };
}

export async function listClients(
  options: ClientListQuery,
): Promise<{ rows: Client[]; total: number }> {
  await requireUser();

  const where = buildWhere(options);
  const direction = options.dir === "desc" ? "DESC" : "ASC";

  const totalRow = await queryOne<{ count: string }>(
    `SELECT count(*)::text AS count FROM clients c ${where.sql}`,
    where.params,
  );
  const total = Number(totalRow?.count ?? 0);

  const rows = await query<Client>(
    `SELECT c.id,
            c.name,
            c.code,
            to_char(c.created_at, 'YYYY-MM-DD') AS created_at,
            to_char(c.updated_at, 'YYYY-MM-DD') AS updated_at,
            (SELECT count(*) FROM deals d WHERE d.client_id = c.id)::int AS deals_count
       FROM clients c
       ${where.sql}
      ORDER BY ${SORT_SQL[options.sort]} ${direction}, c.id ASC
      LIMIT $${where.params.length + 1}
     OFFSET $${where.params.length + 2}`,
    [...where.params, options.perPage, (options.page - 1) * options.perPage],
  );

  return { rows, total };
}

export async function getClient(id: number): Promise<Client | null> {
  await requireUser();

  return queryOne<Client>(
    `SELECT c.id,
            c.name,
            c.code,
            to_char(c.created_at, 'YYYY-MM-DD') AS created_at,
            to_char(c.updated_at, 'YYYY-MM-DD') AS updated_at,
            (SELECT count(*) FROM deals d WHERE d.client_id = c.id)::int AS deals_count
       FROM clients c
      WHERE c.id = $1`,
    [id],
  );
}

/** Полный список для выпадающего выбора клиента в форме сделки. */
export async function listClientOptions(): Promise<
  { id: number; name: string; code: string }[]
> {
  await requireUser();

  return query<{ id: number; name: string; code: string }>(
    "SELECT id, name, code FROM clients ORDER BY name ASC",
  );
}
