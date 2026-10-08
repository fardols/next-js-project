import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { DetailSkeleton } from "@/components/ui/detail";
import { PageHeader } from "@/components/ui/page-header";
import { getClient } from "@/lib/clients";

import { updateClient } from "../../actions";
import { ClientForm } from "../../client-form";

export const metadata: Metadata = {
  title: "Редактирование клиента — Реестр сделок",
};

async function EditClientCard({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const client = await getClient(id);
  if (!client) notFound();

  return (
    <>
      <PageHeader
        title="Редактирование клиента"
        description={client.name}
        back={{ href: `/clients/${client.id}`, label: "К карточке клиента" }}
      />
      <ClientForm
        // id привязывается на сервере — клиент не может подменить его в запросе.
        action={updateClient.bind(null, client.id)}
        initial={{ name: client.name, code: client.code }}
        cancelHref={`/clients/${client.id}`}
        submitLabel="Сохранить изменения"
      />
    </>
  );
}

export default function EditClientPage(props: PageProps<"/clients/[id]/edit">) {
  return (
    <Suspense fallback={<DetailSkeleton rows={3} />}>
      <EditClientCard params={props.params} />
    </Suspense>
  );
}
