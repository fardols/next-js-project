import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE, decodeSession } from "@/lib/session";

const PUBLIC_PATHS = ["/login"];

/**
 * Оптимистичная проверка авторизации: по подписи cookie, без обращения к БД.
 * Нужна только чтобы не показывать «скелет» приватных страниц гостю —
 * настоящая проверка выполняется в Data Access Layer (`lib/auth.ts`).
 */
export default function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
  const session = decodeSession(request.cookies.get(SESSION_COOKIE)?.value);

  if (!session && !isPublic) {
    const url = new URL("/login", request.url);
    if (pathname !== "/") url.searchParams.set("from", `${pathname}${search}`);
    return NextResponse.redirect(url);
  }

  if (session && isPublic) {
    return NextResponse.redirect(new URL("/deals", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Всё, кроме служебных маршрутов Next.js и статических файлов.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg$).*)"],
};
