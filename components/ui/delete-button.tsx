"use client";

import { useLayoutEffect, useState } from "react";
import { useFormStatus } from "react-dom";

type DeleteButtonProps = {
  action: (formData: FormData) => Promise<void>;
  id: number;
  /** Что именно удаляется — подставляется в текст подтверждения. */
  subject: string;
  disabled?: boolean;
  disabledReason?: string;
};

/**
 * Удаление в два шага: первый клик раскрывает подтверждение, второй —
 * отправляет Server Action. Нативный confirm() не используется, чтобы
 * поведение было одинаковым во всех браузерах.
 */
export function DeleteButton({
  action,
  id,
  subject,
  disabled = false,
  disabledReason,
}: DeleteButtonProps) {
  const [confirming, setConfirming] = useState(false);

  // Cache Components не размонтирует покинутые маршруты — сбрасываем
  // подтверждение, чтобы при возврате оно не осталось раскрытым.
  useLayoutEffect(() => () => setConfirming(false), []);

  if (disabled) {
    return (
      <span
        className="btn cursor-not-allowed border-line bg-canvas text-muted"
        title={disabledReason}
      >
        Удалить
      </span>
    );
  }

  if (!confirming) {
    return (
      <button
        type="button"
        className="btn btn-danger"
        onClick={() => setConfirming(true)}
      >
        Удалить
      </button>
    );
  }

  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <span className="text-sm text-muted">Удалить {subject}?</span>
      <ConfirmButton />
      <button
        type="button"
        className="btn btn-secondary"
        onClick={() => setConfirming(false)}
      >
        Отмена
      </button>
    </form>
  );
}

function ConfirmButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className="btn btn-danger">
      {pending ? "Удаление…" : "Да, удалить"}
    </button>
  );
}
