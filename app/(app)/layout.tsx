import { Suspense, type ReactNode } from "react";
import Link from "next/link";

import { MainNav } from "@/components/app-shell/nav";
import { UserMenu, UserMenuSkeleton } from "@/components/app-shell/user-menu";
import { getCurrentUser } from "@/lib/auth";

/**
 * Чтение сессии выполняется в отдельном компоненте внутри <Suspense>:
 * при включённом Cache Components обращение к cookie на верхнем уровне
 * layout задержало бы отрисовку всей страницы, включая {children}.
 */
async function CurrentUser() {
  const user = await getCurrentUser();
  return <UserMenu name={user.name} email={user.email} />;
}

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-20 border-b border-line bg-surface">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-4 px-4 sm:px-6">
          <Link
            href="/deals"
            className="text-sm font-semibold tracking-tight whitespace-nowrap text-ink"
          >
            Реестр&nbsp;сделок
          </Link>

          <MainNav />

          <div className="ml-auto">
            <Suspense fallback={<UserMenuSkeleton />}>
              <CurrentUser />
            </Suspense>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 sm:px-6">
        {children}
      </main>
    </div>
  );
}
