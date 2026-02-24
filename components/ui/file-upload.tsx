"use client";

import { useState, useRef } from "react";

interface FileUploadProps {
  bucket: string;
  path: string;
  accept?: string;
  maxSize?: number;
  onUpload: (url: string) => void;
  onError?: (error: string) => void;
}

export function FileUpload({
  bucket,
  path,
  accept = "image/*",
  maxSize = 5 * 1024 * 1024,
  onUpload,
  onError,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
      const ext = file.name.split(".").pop();
      const filePath = `${path}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from(bucket).upload(filePath, file, {
        upsert: true,
      });
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
    <div
      className="flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50 p-4 transition-colors hover:border-zinc-400 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600"
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
      {preview ? (
        <img src={preview} alt="Preview" className="max-h-24 rounded object-cover" />
      ) : uploading ? (
        <span className="text-sm text-zinc-500">Uploading...</span>
      ) : (
        <span className="text-sm text-zinc-600 dark:text-zinc-400">
          Drop file here or click to upload
        </span>
      )}
    </div>
  );
}
