"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SeriesGrid } from "@/components/SeriesGrid";
import { api, type Series } from "@/lib/api";

const filters = [
  { label: "All", value: "" },
  { label: "Manga", value: "manga" },
  { label: "Novels", value: "novel" },
] as const;

function BrowseContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type") || "";
  const [series, setSeries] = useState<Series[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const query = type ? `?type=${encodeURIComponent(type)}` : "";
        const data = await api<{ series: Series[] }>(`/series${query}`);
        if (!cancelled) setSeries(data.series);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [type]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-5 md:px-8 md:py-10">
      <p className="text-xs uppercase tracking-[0.25em] text-muted">Catalog</p>
      <h1 className="display mt-3 text-4xl sm:text-5xl md:text-7xl">
        {type === "manga" ? "Manga" : type === "novel" ? "Novels" : "Browse"}
      </h1>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {filters.map((f) => {
          const active = type === f.value;
          const href = f.value ? `/browse?type=${f.value}` : "/browse";
          return (
            <Link
              key={f.label}
              href={href}
              className={`shrink-0 border px-4 py-2 text-sm ${
                active
                  ? "chip-active border-white bg-white"
                  : "border-line text-muted hover:border-white hover:text-white"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      <div className="mt-10 md:mt-12">
        {loading && <p className="text-sm text-muted">Loading…</p>}
        {error && <p className="text-sm text-danger">{error}</p>}
        {!loading && !error && <SeriesGrid series={series} />}
      </div>
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<p className="p-8 text-sm text-muted">Loading…</p>}>
      <BrowseContent />
    </Suspense>
  );
}
