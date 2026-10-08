import "server-only";

import { requireUser } from "./auth";
import { query, queryOne } from "./db";
import type { SortDir } from "./list-params";

export type Deal = {
  id: number;
  /** `YYYY-MM-DD` — приводится в SQL, чтобы обойтись без часовых поясов. */
  date: string;
  number: string;
  /** NUMERIC возвращается строкой: так не теряется точность. */
  amount: string;
  client_id: number;
  client_name: string;
  client_code: string;
  description: string;
  created_at: string;
  updated_at: string;
};

export const DEAL_SORT_FIELDS = [
  "id",
  "date",
  "number",
  "amount",
  "client_name",
] as const;
export type DealSortField = (typeof DEAL_SORT_FIELDS)[number];

// Белый список SQL-выражений: имя колонки нельзя передать параметром.
const SORT_SQL: Record<DealSortField, string> = {
  id: "d.id",
  date: "d.date",
  number: "d.number",
  amount: "d.amount",
  client_name: "c.name",
};

export type DealFilters = {
  /** Жёсткий селектор по дате: обе границы включительно. */
  dateFrom: string;
  dateTo: string;
  number: string;
  clientId: number | null;
};

export type DealListQuery = DealFilters & {
  page: number;
  perPage: number;
  sort: DealSortField;
  dir: SortDir;
};

function buildWhere(filters: DealFilters) {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (filters.dateFrom) {
    params.push(filters.dateFrom);
    conditions.push(`d.date >= $${params.length}::date`);
  }
  if (filters.dateTo) {
    params.push(filters.dateTo);
    conditions.push(`d.date <= $${params.length}::date`);
  }
  if (filters.number) {
    params.push(`%${filters.number}%`);
    conditions.push(`d.number ILIKE $${params.length}`);
  }
  if (filters.clientId !== null) {
    params.push(filters.clientId);
    conditions.push(`d.client_id = $${params.length}`);
  }

  return {
    sql: conditions.length ? `WHERE ${conditions.join(" AND ")}` : "",
    params,
  };
}

const SELECT_DEAL = `
  SELECT d.id,
         to_char(d.date, 'YYYY-MM-DD')       AS date,
         d.number,
         d.amount::text                      AS amount,
         d.client_id,
         c.name                              AS client_name,
         c.code                              AS client_code,
         d.description,
         to_char(d.created_at, 'YYYY-MM-DD') AS created_at,
         to_char(d.updated_at, 'YYYY-MM-DD') AS updated_at
    FROM deals d
    JOIN clients c ON c.id = d.client_id`;

export async function listDeals(
  options: DealListQuery,
): Promise<{ rows: Deal[]; total: number; totalAmount: string }> {
  await requireUser();

  const where = buildWhere(options);
  const direction = options.dir === "desc" ? "DESC" : "ASC";

  const totals = await queryOne<{ count: string; sum: string }>(
    `SELECT count(*)::text                       AS count,
            COALESCE(sum(d.amount), 0)::text     AS sum
       FROM deals d
       JOIN clients c ON c.id = d.client_id
       ${where.sql}`,
    where.params,
  );

  const rows = await query<Deal>(
    `${SELECT_DEAL}
     ${where.sql}
     ORDER BY ${SORT_SQL[options.sort]} ${direction}, d.id DESC
     LIMIT $${where.params.length + 1}
    OFFSET $${where.params.length + 2}`,
    [...where.params, options.perPage, (options.page - 1) * options.perPage],
  );

  return {
    rows,
    total: Number(totals?.count ?? 0),
    totalAmount: totals?.sum ?? "0",
  };
}

export async function getDeal(id: number): Promise<Deal | null> {
  await requireUser();
  return queryOne<Deal>(`${SELECT_DEAL} WHERE d.id = $1`, [id]);
}
