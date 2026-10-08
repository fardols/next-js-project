import type { Metadata } from "next";

import { PageHeader } from "@/components/ui/page-header";

import { createClient } from "../actions";
import { ClientForm } from "../client-form";

export const metadata: Metadata = {
  title: "Новый клиент — Реестр сделок",
};

export default function NewClientPage() {
  return (
    <>
      <PageHeader
        title="Новый клиент"
        back={{ href: "/clients", label: "К справочнику клиентов" }}
      />
      <ClientForm
        action={createClient}
        cancelHref="/clients"
        submitLabel="Создать клиента"
      />
    </>
  );
}
