import Link from "next/link";

import { DataTable, type Column, type Row } from "@/components/table/data-table";
import { DateRangePicker } from "@/components/table/date-range-picker";
import { FilterBar } from "@/components/table/filter-bar";
import { listClientOptions } from "@/lib/clients";
import { DEAL_SORT_FIELDS, listDeals } from "@/lib/deals";
import { formatAmount, formatDate } from "@/lib/format";
import {
  flattenParams,
  one,
  parseListParams,
  type SearchParams,
} from "@/lib/list-params";

const COLUMNS: readonly Column[] = [
  { key: "id", header: "ID", sortable: true, align: "right", className: "w-20" },
  { key: "date", header: "Дата", sortable: true, className: "w-32" },
  { key: "number", header: "Номер", sortable: true, locked: true, className: "w-44" },
  { key: "client_name", header: "Клиент", sortable: true },
  {
    key: "amount",
    header: "Сумма",
    sortable: true,
    align: "right",
    className: "w-44",
  },
  { key: "description", header: "Описание" },
  {
    key: "created_at",
    header: "Создана",
    sortable: false,
    className: "w-32",
    hiddenByDefault: true,
  },
  { key: "actions", header: "", className: "w-28" },
];

const FILTER_FIELDS = ["dateFrom", "dateTo", "number", "clientId"] as const;

export async function DealsView({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const list = parseListParams(params, DEAL_SORT_FIELDS, "date", "desc");
  const clientIdRaw = Number(one(params, "clientId"));
  const filters = {
    dateFrom: one(params, "dateFrom"),
    dateTo: one(params, "dateTo"),
    number: one(params, "number"),
    clientId: Number.isInteger(clientIdRaw) && clientIdRaw > 0 ? clientIdRaw : null,
  };

  const [{ rows, total, totalAmount }, clients] = await Promise.all([
    listDeals({ ...list, ...filters }),
    listClientOptions(),
  ]);

  const current = flattenParams(params);

  const tableRows: Row[] = rows.map((deal) => ({
    id: deal.id,
    cells: {
      id: <span className="text-muted tabular-nums">{deal.id}</span>,
      date: <span className="tabular-nums">{formatDate(deal.date)}</span>,
      number: (
        <Link
          href={`/deals/${deal.id}`}
          className="font-mono text-xs font-medium text-accent hover:underline"
        >
          {deal.number}
        </Link>
      ),
      client_name: (
        <Link
          href={`/clients/${deal.client_id}`}
          className="text-ink hover:text-accent hover:underline"
        >
          {deal.client_name}
        </Link>
      ),
      amount: <span className="font-medium">{formatAmount(deal.amount)}</span>,
      description: deal.description ? (
        <span className="line-clamp-2 text-muted">{deal.description}</span>
      ) : (
        <span className="text-line">—</span>
      ),
      created_at: <span className="text-muted">{formatDate(deal.created_at)}</span>,
      actions: (
        <Link
          href={`/deals/${deal.id}/edit`}
          className="text-sm text-muted hover:text-accent hover:underline"
        >
          Изменить
        </Link>
      ),
    },
  }));

  return (
    <>
      <FilterBar
        basePath="/deals"
        params={current}
        fields={FILTER_FIELDS}
        // Пересоздаём панель при смене периода в URL, чтобы состояние
        // селектора дат не расходилось с адресной строкой.
        key={`${filters.dateFrom}|${filters.dateTo}`}
      >
        <DateRangePicker dateFrom={filters.dateFrom} dateTo={filters.dateTo} />

        <div>
          <label className="label" htmlFor="filter-number">
            Номер
          </label>
          <input
            id="filter-number"
            name="number"
            type="search"
            defaultValue={filters.number}
            placeholder="часть номера"
            className="field font-mono"
          />
        </div>

        <div>
          <label className="label" htmlFor="filter-client">
            Клиент
          </label>
          <select
            id="filter-client"
            name="clientId"
            defaultValue={filters.clientId ?? ""}
            className="field"
          >
            <option value="">Все клиенты</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name} ({client.code})
              </option>
            ))}
          </select>
        </div>
      </FilterBar>

      <div className="card mb-4 flex flex-wrap items-baseline gap-x-6 gap-y-1 px-4 py-3">
        <span className="text-sm text-muted">
          Сделок по фильтру: <span className="font-medium text-ink">{total}</span>
        </span>
        <span className="text-sm text-muted">
          Сумма:{" "}
          <span className="font-medium text-ink">{formatAmount(totalAmount)}</span>
        </span>
      </div>

      <DataTable
        storageKey="deals"
        basePath="/deals"
        params={current}
        columns={COLUMNS}
        rows={tableRows}
        total={total}
        page={list.page}
        perPage={list.perPage}
        sort={list.sort}
        dir={list.dir}
        emptyMessage="По заданным условиям сделки не найдены."
      />
    </>
  );
}
