import Link from "next/link";

import { DataTable, type Column, type Row } from "@/components/table/data-table";
import { FilterBar } from "@/components/table/filter-bar";
import { CLIENT_SORT_FIELDS, listClients } from "@/lib/clients";
import { formatDate } from "@/lib/format";
import {
  flattenParams,
  one,
  parseListParams,
  type SearchParams,
} from "@/lib/list-params";

const COLUMNS: readonly Column[] = [
  { key: "id", header: "ID", sortable: true, align: "right", className: "w-20" },
  { key: "name", header: "Наименование", sortable: true, locked: true },
  { key: "code", header: "Код", sortable: true, className: "w-40" },
  {
    key: "deals_count",
    header: "Сделок",
    sortable: true,
    align: "right",
    className: "w-28",
  },
  {
    key: "created_at",
    header: "Создан",
    sortable: true,
    className: "w-32",
    hiddenByDefault: true,
  },
  { key: "actions", header: "", className: "w-28" },
];

const FILTER_FIELDS = ["name", "code"] as const;

export async function ClientsView({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const list = parseListParams(params, CLIENT_SORT_FIELDS, "name", "asc");
  const filters = { name: one(params, "name"), code: one(params, "code") };
  const { rows, total } = await listClients({ ...list, ...filters });

  const current = flattenParams(params);

  const tableRows: Row[] = rows.map((client) => ({
    id: client.id,
    cells: {
      id: <span className="text-muted tabular-nums">{client.id}</span>,
      name: (
        <Link
          href={`/clients/${client.id}`}
          className="font-medium text-accent hover:underline"
        >
          {client.name}
        </Link>
      ),
      code: <span className="font-mono text-xs">{client.code}</span>,
      deals_count:
        client.deals_count > 0 ? (
          <Link
            href={`/deals?clientId=${client.id}`}
            className="text-accent hover:underline"
          >
            {client.deals_count}
          </Link>
        ) : (
          <span className="text-muted">0</span>
        ),
      created_at: <span className="text-muted">{formatDate(client.created_at)}</span>,
      actions: (
        <Link
          href={`/clients/${client.id}/edit`}
          className="text-sm text-muted hover:text-accent hover:underline"
        >
          Изменить
        </Link>
      ),
    },
  }));

  return (
    <>
      <FilterBar basePath="/clients" params={current} fields={FILTER_FIELDS}>
        <div>
          <label className="label" htmlFor="filter-name">
            Наименование
          </label>
          <input
            id="filter-name"
            name="name"
            type="search"
            defaultValue={filters.name}
            placeholder="часть наименования"
            className="field"
          />
        </div>
        <div>
          <label className="label" htmlFor="filter-code">
            Код
          </label>
          <input
            id="filter-code"
            name="code"
            type="search"
            defaultValue={filters.code}
            placeholder="часть кода"
            className="field"
          />
        </div>
      </FilterBar>

      <DataTable
        storageKey="clients"
        basePath="/clients"
        params={current}
        columns={COLUMNS}
        rows={tableRows}
        total={total}
        page={list.page}
        perPage={list.perPage}
        sort={list.sort}
        dir={list.dir}
        emptyMessage="По заданным условиям клиенты не найдены."
      />
    </>
  );
}
