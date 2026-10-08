"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";

export const NAV_LINKS = [
  { href: "/clients", label: "Клиенты" },
  { href: "/deals", label: "Сделки" },
] as const;

const BASE =
  "rounded px-3 py-1.5 text-sm font-medium transition-colors";
const INACTIVE = "text-muted hover:bg-canvas hover:text-ink";
const ACTIVE = "bg-accent/10 text-accent";

/**
 * Подсветка текущего раздела. `usePathname` — runtime-значение, поэтому
 * компонент рендерится внутри <Suspense>, а в статическую оболочку попадает
 * `NavLinksFallback` с той же разметкой без выделения.
 */
export function NavLinks() {
  const pathname = usePathname();

  return (
    <>
      {NAV_LINKS.map((link) => {
        const active =
          pathname === link.href || pathname.startsWith(`${link.href}/`);

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(BASE, active ? ACTIVE : INACTIVE)}
          >
            {link.label}
          </Link>
        );
      })}
    </>
  );
}

export function NavLinksFallback() {
  return (
    <>
      {NAV_LINKS.map((link) => (
        <Link key={link.href} href={link.href} className={cn(BASE, INACTIVE)}>
          {link.label}
        </Link>
      ))}
    </>
  );
}
