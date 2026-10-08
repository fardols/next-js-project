import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { io } from "next/cache";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "app_session";

const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 дней

export type SessionPayload = {
  userId: number;
  /** Unix-время истечения сессии, в секундах. */
  exp: number;
};

function secret(): string {
  const value = process.env.SESSION_SECRET;
  if (!value) {
    throw new Error(
      "Переменная окружения SESSION_SECRET не задана. Скопируйте .env.example в .env.local.",
    );
  }
  return value;
}

const b64url = (input: Buffer | string) =>
  Buffer.from(input).toString("base64url");

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

/** Сериализует сессию в подписанную строку `<payload>.<signature>`. */
export function encodeSession(userId: number): string {
  const payload: SessionPayload = {
    userId,
    exp: Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS,
  };
  const encoded = b64url(JSON.stringify(payload));
  return `${encoded}.${sign(encoded)}`;
}

/**
 * Проверяет подпись и срок действия. Возвращает `null` для любого
 * некорректного, подделанного или просроченного значения.
 *
 * Функция не обращается к БД и не использует API Next.js, поэтому её можно
 * вызывать в том числе из `proxy.ts`.
 */
export function decodeSession(token: string | undefined): SessionPayload | null {
  if (!token) return null;

  const separator = token.lastIndexOf(".");
  if (separator <= 0) return null;

  const encoded = token.slice(0, separator);
  const signature = token.slice(separator + 1);

  const expected = Buffer.from(sign(encoded));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return null;
  }

  let payload: unknown;
  try {
    payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
  } catch {
    return null;
  }

  if (
    typeof payload !== "object" ||
    payload === null ||
    typeof (payload as SessionPayload).userId !== "number" ||
    typeof (payload as SessionPayload).exp !== "number"
  ) {
    return null;
  }

  const session = payload as SessionPayload;
  if (session.exp * 1000 <= Date.now()) return null;

  return session;
}

/** Читает сессию из cookie текущего запроса. */
export async function getSession(): Promise<SessionPayload | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  // Проверка срока действия сравнивает `exp` с текущим временем. Для
  // Cache Components это нестабильное значение, которое нельзя запечь в
  // статическую оболочку: io() отмечает, что дальше идёт чтение времени
  // запроса. Вне пререндера (запрос, server action, proxy) — no-op.
  await io();

  return decodeSession(token);
}

/** Выставляет cookie сессии. Вызывается только из Server Action / Route Handler. */
export async function setSessionCookie(userId: number): Promise<void> {
  (await cookies()).set(SESSION_COOKIE, encodeSession(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearSessionCookie(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}
