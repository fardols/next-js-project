import "server-only";

import { Pool } from "pg";

function createPool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "Переменная окружения DATABASE_URL не задана. Скопируйте .env.example в .env.local.",
    );
  }
  return new Pool({ connectionString, max: 10 });
}

// next dev пересоздаёт модули при HMR — храним пул на globalThis,
// иначе на каждой перезагрузке будет течь новый набор соединений.
const globalForDb = globalThis as typeof globalThis & { __pgPool?: Pool };

export const pool: Pool = globalForDb.__pgPool ?? createPool();

if (process.env.NODE_ENV !== "production") {
  globalForDb.__pgPool = pool;
}

/** Выполняет параметризованный запрос и возвращает строки результата. */
export async function query<T extends Record<string, unknown>>(
  text: string,
  params: readonly unknown[] = [],
): Promise<T[]> {
  const result = await pool.query<T>(text, params as unknown[]);
  return result.rows;
}

/** Как `query`, но возвращает первую строку либо `null`. */
export async function queryOne<T extends Record<string, unknown>>(
  text: string,
  params: readonly unknown[] = [],
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}

/** Код ошибки PostgreSQL (`23505` — нарушение уникальности и т. п.). */
export function pgErrorCode(error: unknown): string | undefined {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = (error as { code: unknown }).code;
    return typeof code === "string" ? code : undefined;
  }
  return undefined;
}
