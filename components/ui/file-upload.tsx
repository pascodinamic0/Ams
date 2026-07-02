"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { Button } from "./button";

interface FileUploadProps {
  bucket: string;
  path: string;
  accept?: string;
  maxSize?: number;
  value?: string;
  onUpload: (url: string) => void;
  onRemove?: () => void;
  onError?: (error: string) => void;
}

export function FileUpload({
  bucket,
  path,
  accept = "image/*",
  maxSize = 5 * 1024 * 1024,
  value,
  onUpload,
  onRemove,
  onError,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreview(null);
  }, [value]);

  const displayUrl = preview ?? value ?? null;

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > maxSize) {
      onError?.(`File too large. Max ${maxSize / 1024 / 1024}MB`);
      return;
    }
    setUploading(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const ext = file.name.split(".").pop() ?? "jpg";
      const filePath = `${path}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from(bucket).upload(filePath, file);
      if (error) throw error;
      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      onUpload(data.publicUrl);
      if (accept.startsWith("image/")) {
        setPreview(URL.createObjectURL(file));
      }
    } catch (err) {
      onError?.(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <div
        className={`relative flex min-h-[140px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-stone-300 bg-stone-50 p-4 transition-colors hover:border-zinc-400 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-900 dark:hover:border-zinc-600 ${
          uploading ? "pointer-events-none opacity-70" : ""
        }`}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleFile}
          disabled={uploading}
        />
        {displayUrl ? (
          <img
            src={displayUrl}
            alt="Uploaded"
            className="max-h-32 w-full rounded object-contain"
          />
        ) : uploading ? (
          <span className="text-sm text-stone-500">Uploading...</span>
        ) : (
          <div className="flex flex-col items-center gap-2 text-center">
            <ImagePlus className="h-8 w-8 text-stone-400" />
            <span className="text-sm text-stone-600 dark:text-stone-400">
              Click to upload an image
            </span>
            <span className="text-xs text-stone-400">JPEG, PNG, WebP up to 5MB</span>
          </div>
        )}
      </div>
      {displayUrl && onRemove && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-red-600 hover:text-red-700 dark:text-red-400"
          onClick={(e) => {
            e.stopPropagation();
            setPreview(null);
            onRemove();
          }}
        >
          <X className="mr-1 h-4 w-4" />
          Remove image
        </Button>
      )}
    </div>
  );
}
