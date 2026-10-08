"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth";
import { pgErrorCode, queryOne } from "@/lib/db";
import {
  clientSchema,
  formValues,
  toFormState,
  type FormState,
} from "@/lib/validation";

const FIELDS = ["name", "code"] as const;

const DUPLICATE_CODE = "Клиент с таким кодом уже существует";

function refresh(id?: number) {
  revalidatePath("/clients");
  revalidatePath("/deals");
  if (id) revalidatePath(`/clients/${id}`);
}

export async function createClient(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireUser();

  const raw = formValues(formData, FIELDS);
  const parsed = clientSchema.safeParse(raw);
  if (!parsed.success) return toFormState(parsed.error, raw);

  let created: { id: number } | null;
  try {
    created = await queryOne<{ id: number }>(
      "INSERT INTO clients (name, code) VALUES ($1, $2) RETURNING id",
      [parsed.data.name, parsed.data.code],
    );
  } catch (error) {
    if (pgErrorCode(error) === "23505") {
      return { status: "error", errors: { code: [DUPLICATE_CODE] }, values: raw };
    }
    throw error;
  }

  refresh();
  redirect(`/clients/${created!.id}`);
}

export async function updateClient(
  id: number,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireUser();

  const raw = formValues(formData, FIELDS);
  const parsed = clientSchema.safeParse(raw);
  if (!parsed.success) return toFormState(parsed.error, raw);

  let updated: { id: number } | null;
  try {
    updated = await queryOne<{ id: number }>(
      `UPDATE clients
          SET name = $2, code = $3, updated_at = now()
        WHERE id = $1
      RETURNING id`,
      [id, parsed.data.name, parsed.data.code],
    );
  } catch (error) {
    if (pgErrorCode(error) === "23505") {
      return { status: "error", errors: { code: [DUPLICATE_CODE] }, values: raw };
    }
    throw error;
  }

  if (!updated) {
    return { status: "error", message: "Клиент не найден", values: raw };
  }

  refresh(id);
  redirect(`/clients/${id}`);
}

export async function deleteClient(formData: FormData): Promise<void> {
  await requireUser();

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) return;

  try {
    await queryOne("DELETE FROM clients WHERE id = $1 RETURNING id", [id]);
  } catch (error) {
    // 23503 — на клиента ссылаются сделки (ON DELETE RESTRICT).
    if (pgErrorCode(error) === "23503") {
      redirect(`/clients/${id}?error=has-deals`);
    }
    throw error;
  }

  refresh();
  redirect("/clients");
}
