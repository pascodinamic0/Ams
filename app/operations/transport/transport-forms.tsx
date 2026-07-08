"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { SearchInput } from "@/components/ui/search-input";
import {
  createTransportRoute,
  createTransportVehicle,
  bulkAssignStudentsToVehicle,
  unassignStudentFromVehicle,
  deleteTransportRoute,
  deleteTransportVehicle,
} from "@/lib/actions/transport";
import { toast } from "@/lib/toast";

export function RouteForm({ branchId }: { branchId: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const result = await createTransportRoute({
      name,
      description: description || undefined,
      branch_id: branchId,
    });
    setLoading(false);
    if (result.error) {
      toast.error("Failed to create route");
      return;
    }
    toast.success("Route created");
    setName("");
    setDescription("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 rounded-lg border p-4 sm:grid-cols-3">
      <div>
        <Label>Route name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <Label>Description</Label>
        <Input value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div className="flex items-end">
        <Button type="submit" disabled={loading} className="w-full">Add route</Button>
      </div>
    </form>
  );
}

export function VehicleForm({
  routes,
}: {
  routes: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [routeId, setRouteId] = useState(routes[0]?.id ?? "");
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!routeId && routes.length > 0) {
      setRouteId(routes[0].id);
    }
  }, [routeId, routes]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!routeId) {
      toast.error("Create a route first");
      return;
    }
    setLoading(true);
    const result = await createTransportVehicle({
      route_id: routeId,
      name,
      capacity: capacity ? Number(capacity) : undefined,
    });
    setLoading(false);
    if (result.error) {
      toast.error("Failed to add vehicle");
      return;
    }
    toast.success("Vehicle added");
    setName("");
    setCapacity("");
    router.refresh();
  }

  if (routes.length === 0) {
    return <p className="text-sm text-stone-500">Create a route before adding vehicles.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2 lg:grid-cols-4">
      <div>
        <Label>Route</Label>
        <select
          value={routeId}
          onChange={(e) => setRouteId(e.target.value)}
          className="w-full rounded-lg border px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-900"
          required
        >
          {routes.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </div>
      <div>
        <Label>Vehicle name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <Label>Capacity</Label>
        <Input type="number" min={1} value={capacity} onChange={(e) => setCapacity(e.target.value)} />
      </div>
      <div className="flex items-end">
        <Button type="submit" disabled={loading} className="w-full">Add vehicle</Button>
      </div>
    </form>
  );
}

export function StudentMappingForm({
  vehicles,
  students,
  assignedStudentIds = [],
}: {
  vehicles: { id: string; name: string; route_name: string }[];
  students: { id: string; name: string }[];
  assignedStudentIds?: string[];
}) {
  const router = useRouter();
  const [vehicleId, setVehicleId] = useState(vehicles[0]?.id ?? "");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [unassignedOnly, setUnassignedOnly] = useState(true);
  const [loading, setLoading] = useState(false);

  const assignedSet = useMemo(() => new Set(assignedStudentIds), [assignedStudentIds]);

  useEffect(() => {
    if (!vehicleId && vehicles.length > 0) {
      setVehicleId(vehicles[0].id);
    }
  }, [vehicleId, vehicles]);

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();
    return students.filter((student) => {
      if (unassignedOnly && assignedSet.has(student.id)) return false;
      if (!query) return true;
      return student.name.toLowerCase().includes(query);
    });
  }, [students, search, unassignedOnly, assignedSet]);

  const toggleStudent = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAllVisible = useCallback(() => {
    setSelectedIds(new Set(filteredStudents.map((s) => s.id)));
  }, [filteredStudents]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selectedIds.size === 0) {
      toast.error("Select at least one student");
      return;
    }
    setLoading(true);
    const result = await bulkAssignStudentsToVehicle({
      vehicle_id: vehicleId,
      student_ids: Array.from(selectedIds),
    });
    setLoading(false);
    if (result.error) {
      toast.error("Failed to assign students");
      return;
    }
    toast.success(
      selectedIds.size === 1
        ? "Student assigned"
        : `${selectedIds.size} students assigned`
    );
    setSelectedIds(new Set());
    router.refresh();
  }

  if (vehicles.length === 0 || students.length === 0) {
    return <p className="text-sm text-stone-500">Add vehicles and students before mapping.</p>;
  }

  const unassignedCount = students.filter((s) => !assignedSet.has(s.id)).length;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label>Vehicle</Label>
          <select
            value={vehicleId}
            onChange={(e) => setVehicleId(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-900"
            required
          >
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.route_name} — {v.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Search students</Label>
          <SearchInput
            placeholder="Filter by name..."
            value={search}
            onSearch={setSearch}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <Checkbox
          id="unassigned-only"
          label={`Show unassigned only (${unassignedCount})`}
          checked={unassignedOnly}
          onChange={(e) => setUnassignedOnly(e.target.checked)}
        />
        <span className="text-stone-400">|</span>
        <button
          type="button"
          onClick={selectAllVisible}
          className="text-primary hover:underline"
          disabled={filteredStudents.length === 0}
        >
          Select all visible ({filteredStudents.length})
        </button>
        <button
          type="button"
          onClick={clearSelection}
          className="text-stone-500 hover:underline"
          disabled={selectedIds.size === 0}
        >
          Clear selection
        </button>
        {selectedIds.size > 0 && (
          <span className="font-medium text-stone-700 dark:text-stone-300">
            {selectedIds.size} selected
          </span>
        )}
      </div>

      <div className="max-h-64 overflow-y-auto rounded-lg border dark:border-stone-700">
        {filteredStudents.length === 0 ? (
          <p className="p-4 text-sm text-stone-500">
            {unassignedOnly && unassignedCount === 0
              ? "All students are already assigned."
              : "No students match your search."}
          </p>
        ) : (
          <ul className="divide-y dark:divide-stone-700">
            {filteredStudents.map((student) => {
              const isAssigned = assignedSet.has(student.id);
              return (
                <li key={student.id}>
                  <label className="flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-stone-50 dark:hover:bg-stone-900">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(student.id)}
                      onChange={() => toggleStudent(student.id)}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <span className="text-sm">{student.name}</span>
                    {isAssigned && (
                      <span className="ml-auto text-xs text-stone-400">assigned elsewhere</span>
                    )}
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <Button type="submit" disabled={loading || selectedIds.size === 0}>
        {loading
          ? "Assigning..."
          : selectedIds.size === 0
            ? "Assign students"
            : selectedIds.size === 1
              ? "Assign 1 student"
              : `Assign ${selectedIds.size} students`}
      </Button>
    </form>
  );
}

export function DeleteRouteButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this route and its vehicles?")) return;
    setLoading(true);
    const result = await deleteTransportRoute(id);
    setLoading(false);
    if (result.error) {
      toast.error("Failed to delete route");
      return;
    }
    toast.success("Route deleted");
    router.refresh();
  }

  return (
    <Button size="sm" variant="ghost" onClick={handleDelete} disabled={loading}>
      Delete
    </Button>
  );
}

export function DeleteVehicleButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this vehicle?")) return;
    setLoading(true);
    const result = await deleteTransportVehicle(id);
    setLoading(false);
    if (result.error) {
      toast.error("Failed to delete vehicle");
      return;
    }
    toast.success("Vehicle deleted");
    router.refresh();
  }

  return (
    <Button size="sm" variant="ghost" onClick={handleDelete} disabled={loading}>
      Delete
    </Button>
  );
}

export function UnassignButton({ mappingId }: { mappingId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleUnassign() {
    setLoading(true);
    const result = await unassignStudentFromVehicle(mappingId);
    setLoading(false);
    if (result.error) {
      toast.error("Failed to unassign student");
      return;
    }
    toast.success("Student unassigned");
    router.refresh();
  }

  return (
    <Button size="sm" variant="ghost" onClick={handleUnassign} disabled={loading}>
      Unassign
    </Button>
  );
}
