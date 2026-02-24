export default async function ChildPerformancePage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;
  return (
    <div>
      <h1 className="text-2xl font-bold">Child Performance</h1>
      <p className="mt-2">Student ID: {studentId}</p>
    </div>
  );
}
