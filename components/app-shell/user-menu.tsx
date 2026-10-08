"use client";

import { Dropdown, DropdownSeparator } from "@/components/ui/dropdown";

import { logout } from "@/app/login/actions";

type UserMenuProps = {
  name: string;
  email: string;
};

export function UserMenu({ name, email }: UserMenuProps) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <Dropdown
      align="right"
      label={
        <span className="flex items-center gap-2">
          <span className="grid size-6 place-items-center rounded-full bg-accent text-[11px] font-semibold text-white">
            {initials}
          </span>
          <span className="hidden sm:inline">{name}</span>
        </span>
      }
    >
      {() => (
        <>
          <div className="px-3 py-2">
            <p className="text-sm font-medium text-ink">{name}</p>
            <p className="mt-0.5 text-xs break-all text-muted">{email}</p>
          </div>
          <DropdownSeparator />
          <form action={logout}>
            <button
              type="submit"
              role="menuitem"
              className="w-full cursor-pointer px-3 py-2 text-left text-sm text-danger transition-colors hover:bg-canvas"
            >
              Выйти
            </button>
          </form>
        </>
      )}
    </Dropdown>
  );
}

/** Заглушка на время загрузки сессии (данные пользователя не пререндерятся). */
export function UserMenuSkeleton() {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5" aria-hidden>
      <span className="size-6 animate-pulse rounded-full bg-line" />
      <span className="hidden h-4 w-24 animate-pulse rounded bg-line sm:inline-block" />
    </div>
  );
}
