import type { ReactNode } from "react";

type FieldProps = {
  label: string;
  htmlFor: string;
  required?: boolean;
  hint?: string;
  errors?: string[];
  children: ReactNode;
};

/** Обёртка поля формы: подпись, подсказка и список ошибок валидации. */
export function Field({
  label,
  htmlFor,
  required = false,
  hint,
  errors,
  children,
}: FieldProps) {
  const hasErrors = Boolean(errors?.length);

  return (
    <div>
      <label className="label" htmlFor={htmlFor}>
        {label}
        {required ? (
          <span className="ml-0.5 text-danger" aria-hidden>
            *
          </span>
        ) : (
          <span className="ml-1.5 text-xs font-normal text-muted">
            необязательно
          </span>
        )}
      </label>

      {children}

      {hint ? (
        <p className="hint" id={`${htmlFor}-hint`}>
          {hint}
        </p>
      ) : null}

      {hasErrors ? (
        <p className="error-text" id={`${htmlFor}-error`} role="alert">
          {errors!.join(". ")}
        </p>
      ) : null}
    </div>
  );
}

/** Общая плашка ошибки формы (не привязанной к конкретному полю). */
export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p
      className="rounded border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger"
      role="alert"
    >
      {message}
    </p>
  );
}
