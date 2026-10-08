import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { queryOne } from "./db";
import { getSession } from "./session";

export type CurrentUser = {
  id: number;
  name: string;
  email: string;
};

/**
 * Единая точка доступа к данным текущего пользователя (Data Access Layer).
 * `cache()` дедуплицирует вызовы в пределах одного запроса.
 */
const loadUser = cache(async (userId: number): Promise<CurrentUser | null> => {
  return queryOne<CurrentUser>(
    "SELECT id, name, email FROM users WHERE id = $1",
    [userId],
  );
});

/**
 * Возвращает пользователя либо перенаправляет на страницу входа.
 *
 * Вызывается из Server Actions и функций доступа к данным: проверка
 * авторизации должна выполняться рядом с данными, а не только в UI.
 */
export async function requireUser(): Promise<CurrentUser> {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await loadUser(session.userId);
  if (!user) redirect("/login");

  return user;
}

/**
 * То же самое для отрисовки UI, но в приватном кеше: чтение cookie нельзя
 * включить в статическую оболочку, поэтому вызывающий компонент обязан
 * находиться внутри <Suspense>. Приватный кеш хранится только в браузере и
 * позволяет префетчить персональную часть страницы.
 */
export async function getCurrentUser(): Promise<CurrentUser> {
  "use cache: private";

  return requireUser();
}
