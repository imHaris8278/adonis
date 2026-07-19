"use client";

import { useEffect, useMemo, useState } from "react";

function revokeAll(urls: string[]) {
  urls.forEach((u) => URL.revokeObjectURL(u));
}

export function CoverPicker({
  name = "cover",
  label = "Cover image",
  hint,
  required = false,
}: {
  name?: string;
  label?: string;
  hint?: string;
  required?: boolean;
}) {
  const [file, setFile] = useState<File | null>(null);
  const preview = useMemo(
    () => (file ? URL.createObjectURL(file) : ""),
    [file]
  );

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  return (
    <div className="space-y-3">
      <div>
        <span className="block text-xs uppercase tracking-[0.2em] text-muted">
          {label}
        </span>
        {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
      </div>
      <div className="grid gap-4 sm:grid-cols-[140px_1fr]">
        <div className="aspect-[3/4] overflow-hidden border border-line bg-[#111]">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Cover preview" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center px-3 text-center text-xs text-muted">
              No cover
            </div>
          )}
        </div>
        <div className="flex flex-col justify-end gap-3">
          <input
            name={name}
            type="file"
            accept="image/*"
            required={required}
            className="w-full text-sm text-muted file:mr-3 file:border file:border-line file:bg-transparent file:px-3 file:py-2 file:text-white"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          {file && (
            <p className="text-xs text-muted">
              {file.name} · {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function MangaPagesPicker({
  name = "pages",
  required = true,
}: {
  name?: string;
  required?: boolean;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => revokeAll(urls);
  }, [files]);

  return (
    <div className="space-y-3">
      <div>
        <span className="block text-xs uppercase tracking-[0.2em] text-muted">
          Chapter pages
        </span>
        <p className="mt-1 text-xs text-muted">
          Upload many page images in reading order (top → bottom). You can select
          dozens at once.
        </p>
      </div>
      <input
        name={name}
        type="file"
        accept="image/*"
        multiple
        required={required}
        className="w-full text-sm text-muted file:mr-3 file:border file:border-line file:bg-transparent file:px-3 file:py-2 file:text-white"
        onChange={(e) => {
          const list = Array.from(e.target.files || []);
          setFiles(list);
        }}
      />
      {files.length > 0 && (
        <>
          <p className="text-sm">
            {files.length} page{files.length === 1 ? "" : "s"} selected
          </p>
          <div className="grid max-h-80 grid-cols-3 gap-2 overflow-y-auto border border-line p-2 sm:grid-cols-4 md:grid-cols-5">
            {previews.map((src, i) => (
              <div key={src} className="relative aspect-[3/4] overflow-hidden bg-[#111]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`Page ${i + 1}`} className="h-full w-full object-cover" />
                <span className="absolute bottom-1 left-1 bg-black/80 px-1.5 py-0.5 text-[10px]">
                  {i + 1}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function WordCount({ text }: { text: string }) {
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  return (
    <p className="text-xs text-muted">
      {words.toLocaleString()} word{words === 1 ? "" : "s"}
    </p>
  );
}
