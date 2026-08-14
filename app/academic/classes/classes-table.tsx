"use client";

import { useTranslations } from "next-intl";
import type { ClassListItem } from "@/lib/db/classes";
import { ClassCapacityEditor } from "./class-capacity-editor";
import { ClassMainTeacherEditor } from "./class-main-teacher-editor";
import { DeleteClassButton } from "./delete-button";

export function ClassesTable({
  classes,
  teachers,
}: {
  classes: ClassListItem[];
  teachers: { id: string; name: string }[];
}) {
  const t = useTranslations("academic");
  const tc = useTranslations("common");

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-surface-raised">
            <th className="px-6 py-4 font-medium text-muted">{tc("name")}</th>
            <th className="px-6 py-4 font-medium text-muted">{t("grade")}</th>
            <th className="px-6 py-4 font-medium text-muted">{t("mainTeacher")}</th>
            <th className="px-6 py-4 font-medium text-muted">{t("capacity")}</th>
            <th className="px-6 py-4 font-medium text-muted" />
          </tr>
        </thead>
        <tbody>
          {classes.map((row, index) => (
            <tr
              key={`${row.id}-${index}`}
              className="border-b border-border last:border-0"
            >
              <td className="px-6 py-4 text-foreground">{row.name}</td>
              <td className="px-6 py-4 text-foreground">
                {row.grade ?? tc("emptyDash")}
              </td>
              <td className="px-6 py-4 text-foreground">
                <ClassMainTeacherEditor
                  id={row.id}
                  mainTeacherId={row.main_teacher_id}
                  teachers={teachers}
                />
              </td>
              <td className="px-6 py-4 text-foreground">
                <ClassCapacityEditor
                  id={row.id}
                  studentCount={row.student_count}
                  capacity={row.capacity}
                />
              </td>
              <td className="px-6 py-4 text-foreground">
                <DeleteClassButton id={row.id} name={row.name} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
