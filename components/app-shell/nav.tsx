import { Suspense } from "react";

import { NavLinks, NavLinksFallback } from "./nav-links";
import { SectionsMenu } from "./sections-menu";

export function MainNav() {
  return (
    <nav className="flex items-center gap-1" aria-label="Основная навигация">
      <SectionsMenu />

      <span className="mx-1 h-5 w-px bg-line" aria-hidden />

      {/* Ссылки попадают в статическую оболочку; подсветка активного
          раздела зависит от URL и дорисовывается после гидратации. */}
      <Suspense fallback={<NavLinksFallback />}>
        <NavLinks />
      </Suspense>
    </nav>
  );
}
