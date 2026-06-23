import { openDB, type IDBPDatabase } from "idb";

export type PendingAttendanceSave = {
  id: string;
  class_id: string;
  date: string;
  period?: number;
  records: {
    student_id: string;
    date: string;
    status: "present" | "absent";
    period?: number;
  }[];
  createdAt: number;
};

type ShuleOsPwaDb = {
  "attendance-queue": {
    key: string;
    value: PendingAttendanceSave;
  };
};

let dbInstance: IDBPDatabase<ShuleOsPwaDb> | null = null;

async function getDB() {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<ShuleOsPwaDb>("shuleos-pwa", 1, {
    upgrade(db) {
      db.createObjectStore("attendance-queue", { keyPath: "id" });
    },
  });

  return dbInstance;
}

export async function queueAttendanceSave(
  payload: Omit<PendingAttendanceSave, "id" | "createdAt">
) {
  const db = await getDB();
  const entry: PendingAttendanceSave = {
    ...payload,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  };
  await db.add("attendance-queue", entry);
  return entry;
}

export async function getPendingAttendanceSaves() {
  const db = await getDB();
  return db.getAll("attendance-queue");
}

export async function removePendingAttendanceSave(id: string) {
  const db = await getDB();
  await db.delete("attendance-queue", id);
}

export async function getPendingAttendanceCount() {
  const pending = await getPendingAttendanceSaves();
  return pending.length;
}
