"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";

import { Field, FormError } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { cn } from "@/lib/cn";
import { EMPTY_FORM_STATE } from "@/lib/validation";

import { login } from "./actions";

export function LoginForm() {
  const [state, formAction] = useActionState(login, EMPTY_FORM_STATE);
  const from = useSearchParams().get("from") ?? "";

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <input type="hidden" name="from" value={from} />

      <FormError message={state.message} />

      <Field label="E-mail" htmlFor="email" required errors={state.errors?.email}>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          defaultValue={state.values?.email}
          aria-invalid={Boolean(state.errors?.email)}
          className={cn("field", state.errors?.email && "field-invalid")}
        />
      </Field>

      <Field
        label="Пароль"
        htmlFor="password"
        required
        errors={state.errors?.password}
      >
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={Boolean(state.errors?.password)}
          className={cn("field", state.errors?.password && "field-invalid")}
        />
      </Field>

      <SubmitButton className="w-full" pendingLabel="Вход…">
        Войти
      </SubmitButton>
    </form>
  );
}
