export default async function SchoolWebsitePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div>
      <h1 className="text-2xl font-bold">School Website Config</h1>
      <p className="mt-2 text-zinc-600">Configure school ID: {id}</p>
    </div>
  );
}
