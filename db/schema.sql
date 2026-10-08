-- Схема БД: пользователи, справочник клиентов, реестр сделок.
-- Скрипт идемпотентен — его можно выполнять повторно.

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  email         TEXT        NOT NULL UNIQUE,
  name          TEXT        NOT NULL,
  password_hash TEXT        NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS clients (
  id         SERIAL PRIMARY KEY,
  name       TEXT        NOT NULL,
  code       TEXT        NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Поиск по name/code выполняется через ILIKE '%...%', поэтому нужны
-- триграммные индексы, а не обычные B-tree.
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS clients_name_trgm_idx ON clients USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS clients_code_trgm_idx ON clients USING gin (code gin_trgm_ops);

CREATE TABLE IF NOT EXISTS deals (
  id          SERIAL PRIMARY KEY,
  date        DATE          NOT NULL,
  number      TEXT          NOT NULL UNIQUE,
  amount      NUMERIC(14,2) NOT NULL CHECK (amount >= 0),
  client_id   INTEGER       NOT NULL REFERENCES clients (id) ON DELETE RESTRICT,
  description TEXT          NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS deals_date_idx ON deals (date DESC);
CREATE INDEX IF NOT EXISTS deals_client_id_idx ON deals (client_id);
CREATE INDEX IF NOT EXISTS deals_number_trgm_idx ON deals USING gin (number gin_trgm_ops);
