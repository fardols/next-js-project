# Реестр сделок — WebApp

Прототип делового веб-приложения: справочник клиентов и реестр сделок с
аутентификацией, поиском, фильтрацией, сортировкой, постраничным выводом и
управлением колонками.

Выполнено по тестовому заданию (`docs/WebApp_Test.pdf`).
## Стек

- **Next.js 16**, **React 19**
- **TypeScript**, **Tailwind CSS v4**
- **PostgreSQL** (драйвер `pg`)
- **Zod** — валидация форм

## Быстрый старт

### 1. Переменные окружения

Создать файл `.env.local` копированием файла `.env.example`
```bash
cp .env.example .env.local
```

В `.env.local` задайте данные базы данных и строку для шифрования сессии:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/dealsdb
SESSION_SECRET=<длинная случайная строка>
```

### 2. База данных

Вариант A — Docker (рекомендуется, не требует локального PostgreSQL):

```bash
docker compose up -d
```

Вариант B — свой экземпляр PostgreSQL: создайте базу `dealsdb` и укажите её в
`DATABASE_URL` в файле `.env.local`.

### 3. Схема и демо-данные

```bash
npm run db:seed
```

Скрипт применит `db/schema.sql`, очистит таблицы и загрузит сгенерированные
данные: 2 пользователя, 60 клиентов, 420 сделок. Повторный запуск
воспроизводит тот же набор.

### 4. Запуск

```bash
npm run dev       # разработка, http://localhost:3000
# или
npm run build && npm start
```

### Учётные записи для входа

```
admin@example.com / admin123
user@example.com  / user1234
```

## Структура

```
app/
  layout.tsx            корневой layout
  login/                страница входа + server actions аутентификации
  (app)/                защищённая зона (общий layout с навигацией)
    clients/            справочник клиентов: список, карточка, формы, actions
    deals/              реестр сделок: список, карточка, формы, actions
components/
  app-shell/            шапка и навигация
  table/                DataTable, панель фильтров, селектор периода
  ui/                   поля формы, кнопки, dropdown, карточка
lib/
  db.ts                 пул соединений и запросы
  session.ts            cookie-сессия (подпись/проверка)
  auth.ts               слой доступа к данным пользователя (DAL)
  password.ts           хеширование пароля (scrypt)
  validation.ts         zod-схемы и состояние форм
  clients.ts / deals.ts запросы к справочнику и реестру
db/schema.sql           схема БД
scripts/seed.ts         наполнение демо-данными
proxy.ts                оптимистичная защита маршрутов
```