"use client";

import { useActionState } from "react";
import Link from "next/link";

import { Field, FormError } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { cn } from "@/lib/cn";
import { EMPTY_FORM_STATE, type FormState } from "@/lib/validation";

export type DealFormValues = {
  date: string;
  number: string;
  amount: string;
  clientId: string;
  description: string;
};

type DealFormProps = {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  clients: readonly { id: number; name: string; code: string }[];
  initial: DealFormValues;
  cancelHref: string;
  submitLabel: string;
};

export function DealForm({
  action,
  clients,
  initial,
  cancelHref,
  submitLabel,
}: DealFormProps) {
  const [state, formAction] = useActionState(action, EMPTY_FORM_STATE);

  // После ошибки показываем введённые значения, а не исходные.
  const value = (field: keyof DealFormValues) =>
    state.values?.[field] ?? initial[field];

  const invalid = (field: keyof DealFormValues) => Boolean(state.errors?.[field]);

  return (
    <form action={formAction} className="card max-w-2xl space-y-4 p-6" noValidate>
      <FormError message={state.message} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Дата" htmlFor="date" required errors={state.errors?.date}>
          <input
            id="date"
            name="date"
            type="date"
            defaultValue={value("date")}
            aria-invalid={invalid("date")}
            className={cn("field", invalid("date") && "field-invalid")}
          />
        </Field>

        <Field
          label="Номер"
          htmlFor="number"
          required
          errors={state.errors?.number}
          hint="Уникальный номер, например D-2026-00001."
        >
          <input
            id="number"
            name="number"
            type="text"
            maxLength={50}
            autoComplete="off"
            spellCheck={false}
            defaultValue={value("number")}
            aria-invalid={invalid("number")}
            className={cn("field font-mono", invalid("number") && "field-invalid")}
          />
        </Field>
      </div>

      <Field
        label="Сумма"
        htmlFor="amount"
        required
        errors={state.errors?.amount}
        hint="Положительное число, до двух знаков после запятой. Разделитель — точка или запятая."
      >
        <input
          id="amount"
          name="amount"
          type="text"
          inputMode="decimal"
          autoComplete="off"
          placeholder="0.00"
          defaultValue={value("amount")}
          aria-invalid={invalid("amount")}
          className={cn("field tabular-nums", invalid("amount") && "field-invalid")}
        />
      </Field>

      <Field
        label="Клиент"
        htmlFor="clientId"
        required
        errors={state.errors?.clientId}
      >
        <select
          id="clientId"
          name="clientId"
          defaultValue={value("clientId")}
          aria-invalid={invalid("clientId")}
          className={cn("field", invalid("clientId") && "field-invalid")}
        >
          <option value="">— выберите клиента —</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name} ({client.code})
            </option>
          ))}
        </select>
      </Field>

      <Field
        label="Описание"
        htmlFor="description"
        errors={state.errors?.description}
        hint="До 2000 символов."
      >
        <textarea
          id="description"
          name="description"
          rows={4}
          maxLength={2000}
          defaultValue={value("description")}
          aria-invalid={invalid("description")}
          className={cn("field resize-y", invalid("description") && "field-invalid")}
        />
      </Field>

      <div className="flex items-center gap-2 border-t border-line pt-4">
        <SubmitButton>{submitLabel}</SubmitButton>
        <Link href={cancelHref} className="btn btn-secondary">
          Отмена
        </Link>
      </div>
    </form>
  );
}
