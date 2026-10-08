"use client";

import { useActionState } from "react";
import Link from "next/link";

import { Field, FormError } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { cn } from "@/lib/cn";
import { EMPTY_FORM_STATE, type FormState } from "@/lib/validation";

type ClientFormProps = {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  initial?: { name: string; code: string };
  cancelHref: string;
  submitLabel: string;
};

export function ClientForm({
  action,
  initial,
  cancelHref,
  submitLabel,
}: ClientFormProps) {
  const [state, formAction] = useActionState(action, EMPTY_FORM_STATE);

  // После неуспешной отправки показываем то, что ввёл пользователь.
  const value = (field: "name" | "code") =>
    state.values?.[field] ?? initial?.[field] ?? "";

  return (
    <form action={formAction} className="card max-w-2xl space-y-4 p-6" noValidate>
      <FormError message={state.message} />

      <Field
        label="Наименование"
        htmlFor="name"
        required
        errors={state.errors?.name}
        hint="От 2 до 200 символов."
      >
        <input
          id="name"
          name="name"
          type="text"
          maxLength={200}
          autoComplete="off"
          defaultValue={value("name")}
          aria-invalid={Boolean(state.errors?.name)}
          className={cn("field", state.errors?.name && "field-invalid")}
        />
      </Field>

      <Field
        label="Код"
        htmlFor="code"
        required
        errors={state.errors?.code}
        hint="Уникальный код: латиница, цифры и символы . _ - / (например, CL-0001)."
      >
        <input
          id="code"
          name="code"
          type="text"
          maxLength={50}
          autoComplete="off"
          spellCheck={false}
          defaultValue={value("code")}
          aria-invalid={Boolean(state.errors?.code)}
          className={cn("field font-mono", state.errors?.code && "field-invalid")}
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
