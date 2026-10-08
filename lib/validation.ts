import { z } from "zod";

/** Состояние формы, возвращаемое Server Action в `useActionState`. */
export type FormState = {
  status: "idle" | "error";
  /** Общая ошибка (нарушение уникальности, сбой БД и т. п.). */
  message?: string;
  /** Ошибки по именам полей. */
  errors?: Record<string, string[]>;
  /** Введённые значения — чтобы форма не обнулялась после ошибки. */
  values?: Record<string, string>;
};

export const EMPTY_FORM_STATE: FormState = { status: "idle" };

/**
 * Приводит пользовательский ввод суммы к каноническому виду:
 * «1 234,56» и «1234.56» → «1234.56».
 */
function normalizeAmount(input: string): string {
  return input.replace(/[\s ]/g, "").replace(",", ".");
}

const requiredText = (label: string, max: number) =>
  z
    .string()
    .trim()
    .min(1, `Поле «${label}» обязательно для заполнения`)
    .max(max, `Не длиннее ${max} символов`);

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Укажите e-mail")
    .pipe(z.email("Некорректный формат e-mail")),
  password: z.string().min(1, "Укажите пароль"),
});

export const clientSchema = z.object({
  name: requiredText("Наименование", 200).min(
    2,
    "Наименование не короче 2 символов",
  ),
  code: requiredText("Код", 50)
    .min(2, "Код не короче 2 символов")
    .regex(
      /^[A-Za-z0-9][A-Za-z0-9._\-/]*$/,
      "Код может содержать только латиницу, цифры и символы . _ - /",
    ),
});

export type ClientInput = z.infer<typeof clientSchema>;

export const dealSchema = z.object({
  date: z
    .string()
    .trim()
    .min(1, "Укажите дату сделки")
    .pipe(z.iso.date("Некорректная дата (ожидается ГГГГ-ММ-ДД)")),
  number: requiredText("Номер", 50).regex(
    /^[A-Za-z0-9][A-Za-z0-9._\-/]*$/,
    "Номер может содержать только латиницу, цифры и символы . _ - /",
  ),
  amount: z
    .string()
    .trim()
    .min(1, "Укажите сумму")
    .transform(normalizeAmount)
    .refine(
      (value) => /^\d{1,12}(\.\d{1,2})?$/.test(value),
      "Сумма — положительное число, не более двух знаков после запятой",
    ),
  clientId: z
    .string()
    .trim()
    .regex(/^[1-9]\d*$/, "Выберите клиента")
    .transform(Number),
  description: z.string().trim().max(2000, "Не длиннее 2000 символов"),
});

export type DealInput = z.infer<typeof dealSchema>;

/** Собирает `FormState` с ошибками полей и сохранёнными значениями. */
export function toFormState(
  error: z.ZodError<unknown>,
  values: Record<string, string>,
): FormState {
  const { fieldErrors } = z.flattenError(error);
  return {
    status: "error",
    errors: fieldErrors as Record<string, string[]>,
    values,
  };
}

/** Читает поля формы как строки — `FormData.get` возвращает `File | string | null`. */
export function formValues<K extends string>(
  formData: FormData,
  keys: readonly K[],
): Record<K, string> {
  const result = {} as Record<K, string>;
  for (const key of keys) {
    const value = formData.get(key);
    result[key] = typeof value === "string" ? value : "";
  }
  return result;
}
