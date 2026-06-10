"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createTransportRoute,
  createTransportVehicle,
  assignStudentToVehicle,
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
    return <p className="text-sm text-slate-500">Create a route before adding vehicles.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2 lg:grid-cols-4">
      <div>
        <Label>Route</Label>
        <select
          value={routeId}
          onChange={(e) => setRouteId(e.target.value)}
          className="w-full rounded-lg border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
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
}: {
  vehicles: { id: string; name: string; route_name: string }[];
  students: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [vehicleId, setVehicleId] = useState(vehicles[0]?.id ?? "");
  const [studentId, setStudentId] = useState(students[0]?.id ?? "");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const result = await assignStudentToVehicle({ vehicle_id: vehicleId, student_id: studentId });
    setLoading(false);
    if (result.error) {
      toast.error("Failed to assign student");
      return;
    }
    toast.success("Student assigned");
    router.refresh();
  }

  if (vehicles.length === 0 || students.length === 0) {
    return <p className="text-sm text-slate-500">Add vehicles and students before mapping.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 rounded-lg border p-4 sm:grid-cols-3">
      <div>
        <Label>Vehicle</Label>
        <select
          value={vehicleId}
          onChange={(e) => setVehicleId(e.target.value)}
          className="w-full rounded-lg border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
          required
        >
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>{v.route_name} — {v.name}</option>
          ))}
        </select>
      </div>
      <div>
        <Label>Student</Label>
        <select
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          className="w-full rounded-lg border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
          required
        >
          {students.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>
      <div className="flex items-end">
        <Button type="submit" disabled={loading} className="w-full">Assign student</Button>
      </div>
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
