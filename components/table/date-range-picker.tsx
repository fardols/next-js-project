"use client";

import { useState } from "react";

import { cn } from "@/lib/cn";

type Range = { dateFrom: string; dateTo: string };

const iso = (date: Date) => {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
};

/** Пресеты периода: вычисляются от текущей даты в часовом поясе браузера. */
const PRESETS: { label: string; range: () => Range }[] = [
  {
    label: "Сегодня",
    range: () => {
      const today = iso(new Date());
      return { dateFrom: today, dateTo: today };
    },
  },
  {
    label: "7 дней",
    range: () => {
      const to = new Date();
      const from = new Date();
      from.setDate(from.getDate() - 6);
      return { dateFrom: iso(from), dateTo: iso(to) };
    },
  },
  {
    label: "Текущий месяц",
    range: () => {
      const now = new Date();
      return {
        dateFrom: iso(new Date(now.getFullYear(), now.getMonth(), 1)),
        dateTo: iso(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
      };
    },
  },
  {
    label: "Прошлый месяц",
    range: () => {
      const now = new Date();
      return {
        dateFrom: iso(new Date(now.getFullYear(), now.getMonth() - 1, 1)),
        dateTo: iso(new Date(now.getFullYear(), now.getMonth(), 0)),
      };
    },
  },
  {
    label: "Квартал",
    range: () => {
      const now = new Date();
      const quarterStart = Math.floor(now.getMonth() / 3) * 3;
      return {
        dateFrom: iso(new Date(now.getFullYear(), quarterStart, 1)),
        dateTo: iso(new Date(now.getFullYear(), quarterStart + 3, 0)),
      };
    },
  },
  {
    label: "Год",
    range: () => {
      const year = new Date().getFullYear();
      return { dateFrom: iso(new Date(year, 0, 1)), dateTo: iso(new Date(year, 11, 31)) };
    },
  },
];

type DateRangePickerProps = {
  dateFrom: string;
  dateTo: string;
};

/**
 * Жёсткий селектор периода: нативные поля `type="date"` (свободный ввод
 * невозможен) плюс быстрые пресеты. Значения отправляются вместе с
 * остальными полями FilterBar как `dateFrom` / `dateTo`.
 */
export function DateRangePicker({ dateFrom, dateTo }: DateRangePickerProps) {
  const [range, setRange] = useState<Range>({ dateFrom, dateTo });
  // Храним выбранный пресет по имени, а не сравниваем даты: пресеты
  // вычисляются от «сегодня», и при SSR это дало бы расхождение разметки.
  const [preset, setPreset] = useState<string | null>(null);

  function update(patch: Partial<Range>) {
    setPreset(null);
    setRange((current) => ({ ...current, ...patch }));
  }

  function applyPreset(label: string, value: Range) {
    setPreset(label);
    setRange(value);
  }

  // Верхняя граница не может быть раньше нижней — ограничиваем на уровне
  // самих полей, чтобы некорректный диапазон нельзя было выбрать.
  return (
    <fieldset className="sm:col-span-2">
      <legend className="label">Период сделки</legend>

      <div className="flex gap-2">
        <input
          type="date"
          name="dateFrom"
          aria-label="Дата с"
          value={range.dateFrom}
          max={range.dateTo || undefined}
          onChange={(event) => update({ dateFrom: event.target.value })}
          className="field"
        />
        <span className="self-center text-muted" aria-hidden>
          —
        </span>
        <input
          type="date"
          name="dateTo"
          aria-label="Дата по"
          value={range.dateTo}
          min={range.dateFrom || undefined}
          onChange={(event) => update({ dateTo: event.target.value })}
          className="field"
        />
      </div>

      <div className="mt-2 flex flex-wrap gap-1">
        {PRESETS.map((item) => (
          <button
            key={item.label}
            type="button"
            aria-pressed={preset === item.label}
            onClick={() => applyPreset(item.label, item.range())}
            className={cn(
              "cursor-pointer rounded border px-2 py-1 text-xs transition-colors",
              preset === item.label
                ? "border-accent bg-accent/10 text-accent"
                : "border-line bg-surface text-muted hover:text-ink",
            )}
          >
            {item.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => applyPreset("all", { dateFrom: "", dateTo: "" })}
          className={cn(
            "cursor-pointer rounded border px-2 py-1 text-xs transition-colors",
            preset === "all"
              ? "border-accent bg-accent/10 text-accent"
              : "border-line bg-surface text-muted hover:text-ink",
          )}
        >
          Весь период
        </button>
      </div>
    </fieldset>
  );
}
