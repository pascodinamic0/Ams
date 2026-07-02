import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function NotFound() {
  const t = await getTranslations("errors");

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <h1 className="text-2xl font-bold">404</h1>
      <p className="mt-2 text-stone-600 dark:text-stone-400">{t("pageNotFound")}</p>
      <Link href="/" className="mt-6 text-stone-900 underline dark:text-stone-100">
        {t("goHome")}
      </Link>
    </div>
  );
}
