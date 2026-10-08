import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { DeleteButton } from "@/components/ui/delete-button";
import { DetailList, DetailRow, DetailSkeleton } from "@/components/ui/detail";
import { FormError } from "@/components/ui/field";
import { PageHeader } from "@/components/ui/page-header";
import { getClient } from "@/lib/clients";
import { formatDate } from "@/lib/format";
import { one, type SearchParams } from "@/lib/list-params";

import { deleteClient } from "../actions";

export const metadata: Metadata = {
  title: "Карточка клиента — Реестр сделок",
};

async function ClientCard({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const client = await getClient(id);
  if (!client) notFound();

  const hasDeals = client.deals_count > 0;
  const deleteError =
    one(await searchParams, "error") === "has-deals"
      ? "Клиента нельзя удалить: на него ссылаются сделки. Сначала удалите или переназначьте их."
      : undefined;

  return (
    <>
      <PageHeader
        title={client.name}
        back={{ href: "/clients", label: "К справочнику клиентов" }}
        actions={
          <>
            <Link href={`/clients/${client.id}/edit`} className="btn btn-secondary">
              Изменить
            </Link>
            <DeleteButton
              action={deleteClient}
              id={client.id}
              subject="клиента"
              disabled={hasDeals}
              disabledReason="На клиента ссылаются сделки"
            />
          </>
        }
      />

      {deleteError ? (
        <div className="mb-4 max-w-3xl">
          <FormError message={deleteError} />
        </div>
      ) : null}

      <div className="max-w-3xl">
        <DetailList>
          <DetailRow label="ID">
            <span className="tabular-nums">{client.id}</span>
          </DetailRow>
          <DetailRow label="Наименование">{client.name}</DetailRow>
          <DetailRow label="Код">
            <span className="font-mono">{client.code}</span>
          </DetailRow>
          <DetailRow label="Сделок в реестре">
            {hasDeals ? (
              <Link
                href={`/deals?clientId=${client.id}`}
                className="text-accent hover:underline"
              >
                {client.deals_count} — перейти к реестру
              </Link>
            ) : (
              <span className="text-muted">нет</span>
            )}
          </DetailRow>
          <DetailRow label="Создан">{formatDate(client.created_at)}</DetailRow>
          <DetailRow label="Изменён">{formatDate(client.updated_at)}</DetailRow>
        </DetailList>
      </div>
    </>
  );
}

export default function ClientPage(props: PageProps<"/clients/[id]">) {
  return (
    <Suspense fallback={<DetailSkeleton rows={6} />}>
      <ClientCard params={props.params} searchParams={props.searchParams} />
    </Suspense>
  );
}
