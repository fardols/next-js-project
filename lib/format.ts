const amountFormatter = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

/** Сумма приходит из PostgreSQL как строка (NUMERIC), чтобы не терять точность. */
export function formatAmount(value: string | number): string {
  const amount = typeof value === "number" ? value : Number(value);
  return Number.isFinite(amount) ? amountFormatter.format(amount) : "—";
}

/** `YYYY-MM-DD` → `ДД.ММ.ГГГГ`. Разбираем вручную, без часовых поясов. */
export function formatDate(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return value;

  const [, year, month, day] = match;
  return dateFormatter.format(new Date(Number(year), Number(month) - 1, Number(day)));
}

/** Сегодняшняя дата в формате `YYYY-MM-DD` по местному времени. */
export function todayISO(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}
