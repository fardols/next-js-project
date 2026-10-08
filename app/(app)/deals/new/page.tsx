import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";

import { DetailSkeleton } from "@/components/ui/detail";
import { PageHeader } from "@/components/ui/page-header";
import { listClientOptions } from "@/lib/clients";
import { todayISO } from "@/lib/format";
import { one, type SearchParams } from "@/lib/list-params";

import { createDeal } from "../actions";
import { DealForm } from "../deal-form";

export const metadata: Metadata = {
  title: "Новая сделка — Реестр сделок",
};

async function NewDealFormSection({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const [clients, params] = await Promise.all([listClientOptions(), searchParams]);

  if (clients.length === 0) {
    return (
      <div className="card max-w-2xl p-6">
        <p className="text-sm text-muted">
          В справочнике нет ни одного клиента. Сделку нельзя создать, пока не
          заведён хотя бы один контрагент.
        </p>
        <Link href="/clients/new" className="btn btn-primary mt-4">
          Добавить клиента
        </Link>
      </div>
    );
  }

  return (
    <DealForm
      action={createDeal}
      clients={clients}
      initial={{
        date: todayISO(),
        number: "",
        amount: "",
        // Переход «создать сделку» из карточки клиента подставляет его сразу.
        clientId: one(params, "clientId"),
        description: "",
      }}
      cancelHref="/deals"
      submitLabel="Создать сделку"
    />
  );
}

export default function NewDealPage(props: PageProps<"/deals/new">) {
  return (
    <>
      <PageHeader
        title="Новая сделка"
        back={{ href: "/deals", label: "К реестру сделок" }}
      />
      <Suspense fallback={<DetailSkeleton rows={5} />}>
        <NewDealFormSection searchParams={props.searchParams} />
      </Suspense>
    </>
  );
}
