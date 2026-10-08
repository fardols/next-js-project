"use server";

import { redirect } from "next/navigation";

import { queryOne } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { clearSessionCookie, setSessionCookie } from "@/lib/session";
import { formValues, loginSchema, toFormState, type FormState } from "@/lib/validation";

/** Защита от open redirect: принимаем только внутренние пути. */
function safeRedirect(target: string): string {
  return /^\/(?!\/)/.test(target) ? target : "/deals";
}

export async function login(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const raw = formValues(formData, ["email", "password"]);
  const parsed = loginSchema.safeParse(raw);

  if (!parsed.success) {
    return toFormState(parsed.error, { email: raw.email });
  }

  const user = await queryOne<{ id: number; password_hash: string }>(
    "SELECT id, password_hash FROM users WHERE lower(email) = lower($1)",
    [parsed.data.email],
  );

  // Одинаковый текст для неизвестного e-mail и неверного пароля —
  // чтобы нельзя было перебором узнать существующие учётные записи.
  const invalid: FormState = {
    status: "error",
    message: "Неверный e-mail или пароль",
    values: { email: raw.email },
  };

  if (!user) return invalid;
  if (!(await verifyPassword(parsed.data.password, user.password_hash))) {
    return invalid;
  }

  await setSessionCookie(user.id);
  redirect(safeRedirect(formValues(formData, ["from"]).from));
}

export async function logout(): Promise<void> {
  await clearSessionCookie();
  redirect("/login");
}
