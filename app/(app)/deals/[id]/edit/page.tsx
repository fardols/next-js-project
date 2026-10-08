import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { DetailSkeleton } from "@/components/ui/detail";
import { PageHeader } from "@/components/ui/page-header";
import { listClientOptions } from "@/lib/clients";
import { getDeal } from "@/lib/deals";

import { updateDeal } from "../../actions";
import { DealForm } from "../../deal-form";

export const metadata: Metadata = {
  title: "Редактирование сделки — Реестр сделок",
};

async function EditDealCard({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const [deal, clients] = await Promise.all([getDeal(id), listClientOptions()]);
  if (!deal) notFound();

  return (
    <>
      <PageHeader
        title="Редактирование сделки"
        description={deal.number}
        back={{ href: `/deals/${deal.id}`, label: "К карточке сделки" }}
      />
      <DealForm
        // id привязывается на сервере — клиент не может подменить его в запросе.
        action={updateDeal.bind(null, deal.id)}
        clients={clients}
        initial={{
          date: deal.date,
          number: deal.number,
          amount: deal.amount,
          clientId: String(deal.client_id),
          description: deal.description,
        }}
        cancelHref={`/deals/${deal.id}`}
        submitLabel="Сохранить изменения"
      />
    </>
  );
}

export default function EditDealPage(props: PageProps<"/deals/[id]/edit">) {
  return (
    <Suspense fallback={<DetailSkeleton rows={5} />}>
      <EditDealCard params={props.params} />
    </Suspense>
  );
}
