"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth";
import { pgErrorCode, queryOne } from "@/lib/db";
import {
  dealSchema,
  formValues,
  toFormState,
  type FormState,
} from "@/lib/validation";

const FIELDS = ["date", "number", "amount", "clientId", "description"] as const;

const DUPLICATE_NUMBER = "Сделка с таким номером уже существует";
const UNKNOWN_CLIENT = "Выбранный клиент не найден";

function refresh(id?: number) {
  revalidatePath("/deals");
  revalidatePath("/clients");
  if (id) revalidatePath(`/deals/${id}`);
}

/** Переводит ошибки ограничений PostgreSQL в сообщения у полей формы. */
function constraintToFormState(
  error: unknown,
  values: Record<string, string>,
): FormState | null {
  switch (pgErrorCode(error)) {
    case "23505":
      return { status: "error", errors: { number: [DUPLICATE_NUMBER] }, values };
    case "23503":
      return { status: "error", errors: { clientId: [UNKNOWN_CLIENT] }, values };
    default:
      return null;
  }
}

export async function createDeal(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireUser();

  const raw = formValues(formData, FIELDS);
  const parsed = dealSchema.safeParse(raw);
  if (!parsed.success) return toFormState(parsed.error, raw);

  const deal = parsed.data;

  let created: { id: number } | null;
  try {
    created = await queryOne<{ id: number }>(
      `INSERT INTO deals (date, number, amount, client_id, description)
       VALUES ($1::date, $2, $3::numeric, $4, $5)
       RETURNING id`,
      [deal.date, deal.number, deal.amount, deal.clientId, deal.description],
    );
  } catch (error) {
    const state = constraintToFormState(error, raw);
    if (state) return state;
    throw error;
  }

  refresh();
  redirect(`/deals/${created!.id}`);
}

export async function updateDeal(
  id: number,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireUser();

  const raw = formValues(formData, FIELDS);
  const parsed = dealSchema.safeParse(raw);
  if (!parsed.success) return toFormState(parsed.error, raw);

  const deal = parsed.data;

  let updated: { id: number } | null;
  try {
    updated = await queryOne<{ id: number }>(
      `UPDATE deals
          SET date        = $2::date,
              number      = $3,
              amount      = $4::numeric,
              client_id   = $5,
              description = $6,
              updated_at  = now()
        WHERE id = $1
      RETURNING id`,
      [id, deal.date, deal.number, deal.amount, deal.clientId, deal.description],
    );
  } catch (error) {
    const state = constraintToFormState(error, raw);
    if (state) return state;
    throw error;
  }

  if (!updated) {
    return { status: "error", message: "Сделка не найдена", values: raw };
  }

  refresh(id);
  redirect(`/deals/${id}`);
}

export async function deleteDeal(formData: FormData): Promise<void> {
  await requireUser();

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) return;

  await queryOne("DELETE FROM deals WHERE id = $1 RETURNING id", [id]);

  refresh();
  redirect("/deals");
}
