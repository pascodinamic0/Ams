import { getTranslations } from "next-intl/server";

type MessageValues = Record<string, string | number | Date>;

export async function actionError(
  key: string,
  values?: MessageValues
): Promise<{ error: string }> {
  const t = await getTranslations("errors");
  return { error: t(key, values) };
}

export async function zodIssueError(
  message: string | undefined
): Promise<{ error: string }> {
  const t = await getTranslations("validation");
  const key = message ?? "fieldRequired";
  return { error: t.has(key) ? t(key) : t("fieldRequired") };
}
