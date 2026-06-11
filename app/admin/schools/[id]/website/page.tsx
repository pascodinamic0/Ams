import { redirect } from "next/navigation";

export default async function LegacyWebsiteConfigPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/admin/websites/${id}`);
}
