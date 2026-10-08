import { Suspense } from "react";
import type { Metadata } from "next";

import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Вход — Реестр сделок",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="mb-6">
          <h1 className="text-xl font-semibold tracking-tight">Реестр сделок</h1>
          <p className="mt-1 text-sm text-muted">
            Введите учётные данные для входа в систему.
          </p>
        </div>

        <div className="card p-6">
          {/* LoginForm читает ?from= через useSearchParams. */}
          <Suspense fallback={<div className="h-64" />}>
            <LoginForm />
          </Suspense>
        </div>

        <p className="mt-4 text-xs leading-relaxed text-muted">
          Демонстрационные учётные записи:
          <br />
          <code className="font-mono">admin@example.com / admin123</code>
          <br />
          <code className="font-mono">user@example.com / user1234</code>
        </p>
      </div>
    </main>
  );
}
