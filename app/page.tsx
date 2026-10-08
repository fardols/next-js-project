import { redirect } from "next/navigation";

export default function RootPage() {
  // Стартовый экран приложения — реестр сделок.
  // Неавторизованных пользователей перехватит proxy.ts.
  redirect("/deals");
}
