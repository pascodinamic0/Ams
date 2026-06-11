import { redirect } from "next/navigation";

export default async function PublicAdmissionsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/schools/${slug}/enroll`);
}
