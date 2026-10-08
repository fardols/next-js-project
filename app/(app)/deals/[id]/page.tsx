import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { DeleteButton } from "@/components/ui/delete-button";
import { DetailList, DetailRow, DetailSkeleton } from "@/components/ui/detail";
import { PageHeader } from "@/components/ui/page-header";
import { getDeal } from "@/lib/deals";
import { formatAmount, formatDate } from "@/lib/format";

import { deleteDeal } from "../actions";

export const metadata: Metadata = {
  title: "Карточка сделки — Реестр сделок",
};

async function DealCard({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const deal = await getDeal(id);
  if (!deal) notFound();

  return (
    <>
      <PageHeader
        title={`Сделка ${deal.number}`}
        back={{ href: "/deals", label: "К реестру сделок" }}
        actions={
          <>
            <Link href={`/deals/${deal.id}/edit`} className="btn btn-secondary">
              Изменить
            </Link>
            <DeleteButton action={deleteDeal} id={deal.id} subject="сделку" />
          </>
        }
      />

      <div className="max-w-3xl">
        <DetailList>
          <DetailRow label="ID">
            <span className="tabular-nums">{deal.id}</span>
          </DetailRow>
          <DetailRow label="Дата">
            <span className="tabular-nums">{formatDate(deal.date)}</span>
          </DetailRow>
          <DetailRow label="Номер">
            <span className="font-mono">{deal.number}</span>
          </DetailRow>
          <DetailRow label="Сумма">
            <span className="font-medium">{formatAmount(deal.amount)}</span>
          </DetailRow>
          <DetailRow label="Клиент">
            <Link
              href={`/clients/${deal.client_id}`}
              className="text-accent hover:underline"
            >
              {deal.client_name}
            </Link>
            <span className="ml-2 font-mono text-xs text-muted">
              {deal.client_code}
            </span>
          </DetailRow>
          <DetailRow label="Описание">
            {deal.description ? (
              <span className="whitespace-pre-wrap">{deal.description}</span>
            ) : (
              <span className="text-muted">не заполнено</span>
            )}
          </DetailRow>
          <DetailRow label="Создана">{formatDate(deal.created_at)}</DetailRow>
          <DetailRow label="Изменена">{formatDate(deal.updated_at)}</DetailRow>
        </DetailList>
      </div>
    </>
  );
}

export default function DealPage(props: PageProps<"/deals/[id]">) {
  return (
    <Suspense fallback={<DetailSkeleton rows={8} />}>
      <DealCard params={props.params} />
    </Suspense>
  );
}
