import Link from "next/link";
import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description?: string;
  /** Хлебные крошки без текущей страницы. */
  back?: { href: string; label: string };
  actions?: ReactNode;
};

export function PageHeader({ title, description, back, actions }: PageHeaderProps) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div>
        {back ? (
          <Link
            href={back.href}
            className="mb-1 inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-accent"
          >
            <span aria-hidden>←</span> {back.label}
          </Link>
        ) : null}
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        {description ? (
          <p className="mt-1 text-sm text-muted">{description}</p>
        ) : null}
      </div>

      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}
