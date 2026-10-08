"use client";

import { useFormStatus } from "react-dom";

import { cn } from "@/lib/cn";

type SubmitButtonProps = {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
};

/** Кнопка отправки формы, блокирующаяся на время выполнения Server Action. */
export function SubmitButton({
  children,
  pendingLabel,
  className,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={cn("btn btn-primary", className)}
    >
      {pending ? (pendingLabel ?? "Сохранение…") : children}
    </button>
  );
}
