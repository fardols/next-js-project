import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="text-5xl font-semibold tracking-tight text-line">404</p>
      <h1 className="text-lg font-semibold">Страница или запись не найдена</h1>
      <p className="max-w-md text-sm text-muted">
        Возможно, запись была удалена или ссылка указана неверно.
      </p>
      <Link href="/deals" className="btn btn-primary">
        К реестру сделок
      </Link>
    </main>
  );
}
