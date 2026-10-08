/**
 * Создаёт схему БД и наполняет её демонстрационными данными.
 *
 *   npm run db:seed
 *
 * Скрипт выполняется вне Next.js (через tsx), поэтому он сам читает .env
 * и открывает собственное соединение с PostgreSQL.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { randomBytes, scryptSync } from "node:crypto";
import { Pool } from "pg";

// Скрипт запускается через npm run, т. е. рабочий каталог — корень проекта.
const ROOT = resolve(process.cwd());

function loadEnv() {
  for (const file of [".env.local", ".env"]) {
    let raw: string;
    try {
      raw = readFileSync(resolve(ROOT, file), "utf8");
    } catch {
      continue;
    }
    for (const line of raw.split(/\r?\n/)) {
      const match = /^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/i.exec(line);
      if (!match) continue;
      const [, key, rawValue] = match;
      if (process.env[key] !== undefined) continue;
      process.env[key] = rawValue.trim().replace(/^(['"])(.*)\1$/, "$2");
    }
  }
}

function hashPassword(password: string): string {
  const salt = randomBytes(16);
  return `${salt.toString("hex")}:${scryptSync(password, salt, 64).toString("hex")}`;
}

/** Детерминированный ГПСЧ — повторный запуск даёт тот же набор данных. */
function makeRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = makeRandom(20260407);
const pick = <T>(items: readonly T[]): T => items[Math.floor(rand() * items.length)];
const int = (min: number, max: number) => min + Math.floor(rand() * (max - min + 1));

const LEGAL_FORMS = ["ООО", "АО", "ПАО", "ЗАО", "ИП"] as const;
const PREFIXES = [
  "Альфа", "Бета", "Гамма", "Вектор", "Горизонт", "Меридиан", "Союз", "Прогресс",
  "Техно", "Нова", "Атлант", "Базис", "Квант", "Логос", "Магнит", "Ореол",
  "Партнёр", "Ресурс", "Сигма", "Транзит", "Унисон", "Форвард", "Эксперт", "Янтарь",
] as const;
const SUFFIXES = [
  "Строй", "Трейд", "Групп", "Инвест", "Логистик", "Сервис", "Пром", "Консалт",
  "Систем", "Медиа", "Агро", "Энерго",
] as const;
const DESCRIPTIONS = [
  "Поставка оборудования по рамочному договору",
  "Оказание консультационных услуг",
  "Подряд на монтажные работы",
  "Лицензия на программное обеспечение, годовая подписка",
  "Техническое обслуживание, квартальный платёж",
  "Поставка расходных материалов",
  "Разработка проектной документации",
  "Транспортно-экспедиционные услуги",
  "Аренда складских помещений",
  "Аудит информационной безопасности",
  "",
] as const;

function uniqueClients(count: number) {
  const seen = new Set<string>();
  const clients: { name: string; code: string }[] = [];
  let guard = 0;

  while (clients.length < count && guard++ < count * 50) {
    // Чаще двухсловные названия, иногда односоставные — выглядит естественнее.
    const core =
      rand() < 0.75
        ? `${pick(PREFIXES)}${pick(SUFFIXES)}`
        : pick(PREFIXES);
    const name = `${pick(LEGAL_FORMS)} «${core}»`;
    if (seen.has(name)) continue;
    seen.add(name);

    const code = `CL-${String(clients.length + 1).padStart(4, "0")}`;
    clients.push({ name, code });
  }

  return clients;
}

/** Дата в пределах последних `monthsBack` месяцев, формат YYYY-MM-DD. */
function randomDate(monthsBack: number): string {
  const now = new Date();
  const end = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const start = end - monthsBack * 30 * 24 * 60 * 60 * 1000;
  return new Date(start + rand() * (end - start)).toISOString().slice(0, 10);
}

async function main() {
  loadEnv();

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL не задан. Скопируйте .env.example в .env.local.");
  }

  const pool = new Pool({ connectionString });
  const client = await pool.connect();

  try {
    console.log("→ Применяю схему (db/schema.sql)…");
    await client.query(readFileSync(resolve(ROOT, "db/schema.sql"), "utf8"));

    await client.query("BEGIN");

    console.log("→ Очищаю таблицы…");
    await client.query("TRUNCATE deals, clients RESTART IDENTITY CASCADE");

    console.log("→ Создаю пользователей…");
    const users = [
      { email: "admin@example.com", name: "Администратор", password: "admin123" },
      { email: "user@example.com", name: "Иван Петров", password: "user1234" },
    ];
    for (const user of users) {
      await client.query(
        `INSERT INTO users (email, name, password_hash)
         VALUES ($1, $2, $3)
         ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name,
                                           password_hash = EXCLUDED.password_hash`,
        [user.email, user.name, hashPassword(user.password)],
      );
    }

    const clients = uniqueClients(60);
    console.log(`→ Создаю клиентов: ${clients.length}…`);
    const clientIds: number[] = [];
    for (const c of clients) {
      const { rows } = await client.query<{ id: number }>(
        "INSERT INTO clients (name, code) VALUES ($1, $2) RETURNING id",
        [c.name, c.code],
      );
      clientIds.push(rows[0].id);
    }

    const DEALS = 420;
    console.log(`→ Создаю сделки: ${DEALS}…`);
    for (let i = 1; i <= DEALS; i++) {
      await client.query(
        `INSERT INTO deals (date, number, amount, client_id, description)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          randomDate(18),
          `D-2026-${String(i).padStart(5, "0")}`,
          (int(5_000, 9_500_000) / 100).toFixed(2),
          pick(clientIds),
          pick(DESCRIPTIONS),
        ],
      );
    }

    await client.query("COMMIT");

    console.log("\n✓ Готово. Учётные записи для входа:");
    for (const user of users) {
      console.log(`    ${user.email} / ${user.password}`);
    }
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error("\n✗ Не удалось выполнить сидирование:\n", error);
  process.exit(1);
});
