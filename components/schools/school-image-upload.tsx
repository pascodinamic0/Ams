"use client";

import { FileUpload } from "@/components/ui/file-upload";
import { Label } from "@/components/ui/label";
import { toast } from "@/lib/toast";

const SCHOOL_ASSETS_BUCKET = "school-assets";

type SchoolImageUploadProps = {
  schoolId: string;
  folder: string;
  label: string;
  value: string;
  onChange: (url: string) => void;
};

export function SchoolImageUpload({
  schoolId,
  folder,
  label,
  value,
  onChange,
}: SchoolImageUploadProps) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-2">
        <FileUpload
          bucket={SCHOOL_ASSETS_BUCKET}
          path={`${schoolId}/${folder}`}
          maxSize={10 * 1024 * 1024}
          value={value || undefined}
          onUpload={(url) => {
            onChange(url);
            toast.success("Image uploaded");
          }}
          onRemove={() => onChange("")}
          onError={(message) => toast.error(message)}
        />
      </div>
    </div>
  );
}
