import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";

import { TableSkeleton } from "@/components/table/table-skeleton";
import { PageHeader } from "@/components/ui/page-header";

import { ClientsView } from "./clients-view";

export const metadata: Metadata = {
  title: "Клиенты — Реестр сделок",
};

export default function ClientsPage(props: PageProps<"/clients">) {
  return (
    <>
      <PageHeader
        title="Справочник клиентов"
        description="Карточки контрагентов. Поиск по наименованию и коду."
        actions={
          <Link href="/clients/new" className="btn btn-primary">
            Добавить клиента
          </Link>
        }
      />

      {/* Данные зависят от searchParams и сессии, поэтому таблица
          стримится внутрь статической оболочки страницы. */}
      <Suspense fallback={<TableSkeleton />}>
        <ClientsView searchParams={props.searchParams} />
      </Suspense>
    </>
  );
}
