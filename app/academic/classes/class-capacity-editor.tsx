"use client";

import { useRef, useState } from "react";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateClass } from "@/lib/actions/classes";
import { toast } from "@/lib/toast";

export function ClassCapacityEditor({
  id,
  studentCount,
  capacity,
}: {
  id: string;
  studentCount: number;
  capacity: number | null;
}) {
  const t = useTranslations("academic");
  const tc = useTranslations("common");
  const router = useRouter();
  const [value, setValue] = useState(capacity?.toString() ?? "");
  const [loading, setLoading] = useState(false);
  const savingRef = useRef(false);

  const parsed = value.trim() === "" ? null : Number(value);
  const dirty = parsed !== capacity;

  async function save() {
    if (!dirty || savingRef.current) return;
    if (parsed !== null && (!Number.isInteger(parsed) || parsed < 1)) {
      toast.error(t("classUpdateFailed"));
      return;
    }

    savingRef.current = true;
    setLoading(true);
    const result = await updateClass(id, { capacity: parsed });
    setLoading(false);
    savingRef.current = false;
    if ("error" in result && result.error) {
      toast.error(
        typeof result.error === "string" ? result.error : t("classUpdateFailed")
      );
      return;
    }
    toast.success(t("classUpdated"));
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <span className="whitespace-nowrap text-sm text-stone-500">{studentCount} /</span>
      <Input
        type="number"
        min={1}
        className="h-8 w-20"
        value={value}
        disabled={loading}
        aria-label={t("capacity")}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => void save()}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            void save();
          }
        }}
      />
      {dirty ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={loading}
          onClick={() => void save()}
          aria-label={tc("save")}
        >
          <Check className="h-4 w-4" />
        </Button>
      ) : null}
    </div>
  );
}
