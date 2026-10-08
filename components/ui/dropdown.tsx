"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";

import { cn } from "@/lib/cn";

type DropdownProps = {
  label: ReactNode;
  children: (close: () => void) => ReactNode;
  align?: "left" | "right";
  className?: string;
};

/**
 * Выпадающее меню: закрывается по клику вне, по Escape и при выборе пункта
 * (`DropdownLink` вызывает `onSelect` в `onNavigate`).
 *
 * Cache Components держит покинутые маршруты смонтированными через <Activity>,
 * поэтому открытое состояние сбрасывается в cleanup у useLayoutEffect —
 * иначе при возврате на страницу меню оказалось бы раскрытым.
 */
export function Dropdown({
  label,
  children,
  align = "left",
  className,
}: DropdownProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  // Cache Components не размонтирует покинутые маршруты — сбрасываем
  // состояние в cleanup, чтобы при возврате меню не осталось раскрытым.
  useLayoutEffect(() => close, [close]);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) close();
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  return (
    <div className={cn("relative", className)} ref={containerRef}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "inline-flex cursor-pointer items-center gap-1.5 rounded px-3 py-1.5 text-sm font-medium transition-colors",
          open ? "bg-canvas text-ink" : "text-ink hover:bg-canvas",
        )}
      >
        {label}
        <svg
          viewBox="0 0 12 12"
          aria-hidden
          className={cn(
            "size-3 text-muted transition-transform",
            open && "rotate-180",
          )}
        >
          <path
            d="M2.5 4.5 6 8l3.5-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          className={cn(
            "absolute top-full z-30 mt-1 min-w-56 overflow-hidden rounded-lg border border-line bg-surface py-1 shadow-lg",
            align === "right" ? "right-0" : "left-0",
          )}
        >
          {children(close)}
        </div>
      ) : null}
    </div>
  );
}

/** Пункт меню — ссылка. */
export function DropdownLink({
  href,
  onSelect,
  children,
  description,
}: {
  href: string;
  onSelect: () => void;
  children: ReactNode;
  description?: string;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      onNavigate={onSelect}
      className="block px-3 py-2 text-sm text-ink transition-colors hover:bg-canvas"
    >
      {children}
      {description ? (
        <span className="mt-0.5 block text-xs text-muted">{description}</span>
      ) : null}
    </Link>
  );
}

/** Заголовок группы пунктов. */
export function DropdownLabel({ children }: { children: ReactNode }) {
  return (
    <p className="px-3 pt-2 pb-1 text-xs font-semibold tracking-wide text-muted uppercase">
      {children}
    </p>
  );
}

export function DropdownSeparator() {
  return <hr className="my-1 border-line" />;
}
