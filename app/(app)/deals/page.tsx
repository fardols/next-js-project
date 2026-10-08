import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";

import { TableSkeleton } from "@/components/table/table-skeleton";
import { PageHeader } from "@/components/ui/page-header";

import { DealsView } from "./deals-view";

export const metadata: Metadata = {
  title: "Сделки — Реестр сделок",
};

export default function DealsPage(props: PageProps<"/deals">) {
  return (
    <>
      <PageHeader
        title="Реестр сделок"
        description="Фильтрация по периоду, номеру и клиенту."
        actions={
          <Link href="/deals/new" className="btn btn-primary">
            Добавить сделку
          </Link>
        }
      />

      <Suspense fallback={<TableSkeleton rows={10} />}>
        <DealsView searchParams={props.searchParams} />
      </Suspense>
    </>
  );
}
