import { getCurrentProfile } from "@/lib/auth/session";
import {
  getGuardianByAuthUserId,
  getLinkedStudentsForGuardian,
  getTransportForStudents,
} from "@/lib/db";
import { EmptyState } from "@/components/ui/empty-state";

export default async function ParentTransportPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    return (
      <EmptyState title="Not signed in" description="Please log in to view transport." />
    );
  }

  const guardian = await getGuardianByAuthUserId(profile.id);
  if (!guardian) {
    return (
      <EmptyState
        title="No guardian profile"
        description="Your account is not linked to a guardian profile."
      />
    );
  }

  const children = await getLinkedStudentsForGuardian(guardian.id);
  const transportRows = await getTransportForStudents(children.map((c) => c.id));
  const transportByStudent = new Map(transportRows.map((t) => [t.student_id, t]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Transport</h1>
        <p className="mt-1 text-sm text-slate-500">
          Bus route and vehicle details for your children (read-only).
        </p>
      </div>

      {children.length === 0 ? (
        <EmptyState
          title="No students linked"
          description="Contact the school to link your children to your account."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {children.map((child) => {
            const transport = transportByStudent.get(child.id);
            return (
              <div
                key={child.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900"
              >
                <p className="font-semibold text-slate-900 dark:text-white">{child.name}</p>
                <p className="text-xs text-slate-500">{child.class_name ?? "No class"}</p>
                {!transport ? (
                  <p className="mt-4 text-sm text-slate-500">
                    No transport assignment on file.
                  </p>
                ) : (
                  <dl className="mt-4 space-y-3 text-sm">
                    <div>
                      <dt className="text-xs font-medium text-slate-500">Route</dt>
                      <dd className="font-medium text-slate-900 dark:text-white">
                        {transport.route_name}
                      </dd>
                      {transport.route_description && (
                        <dd className="text-slate-500">{transport.route_description}</dd>
                      )}
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-slate-500">Vehicle</dt>
                      <dd className="font-medium text-slate-900 dark:text-white">
                        {transport.vehicle_name}
                        {transport.vehicle_capacity != null && (
                          <span className="ml-2 text-slate-500">
                            (capacity {transport.vehicle_capacity})
                          </span>
                        )}
                      </dd>
                    </div>
                  </dl>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
