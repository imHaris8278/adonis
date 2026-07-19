"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, type Series } from "@/lib/api";

type DashboardData = {
  stats: {
    users: number;
    series: number;
    chapters: number;
    manga: number;
    novels: number;
    totalViews: number;
  };
  topSeries: Series[];
};

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const payload = await api<DashboardData>("/admin/dashboard");
        setData(payload);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load");
      }
    })();
  }, []);

  if (error) return <p className="text-sm text-danger">{error}</p>;
  if (!data) return <p className="text-sm text-muted">Loading…</p>;

  const tiles = [
    { label: "Total views", value: data.stats.totalViews },
    { label: "Readers", value: data.stats.users },
    { label: "Series", value: data.stats.series },
    { label: "Chapters", value: data.stats.chapters },
    { label: "Manga", value: data.stats.manga },
    { label: "Novels", value: data.stats.novels },
  ];

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-muted">
            Overview
          </p>
          <h1 className="display mt-2 text-4xl sm:text-5xl">Dashboard</h1>
        </div>
        <Link href="/admin/publish" className="btn btn-solid w-full sm:w-auto">
          Publish new
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-4 lg:grid-cols-3">
        {tiles.map((tile) => (
          <div key={tile.label} className="border border-line p-4 sm:p-5">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted sm:text-xs">
              {tile.label}
            </p>
            <p className="display mt-2 text-2xl sm:mt-3 sm:text-4xl">
              {tile.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-12 sm:mt-14">
        <h2 className="display text-2xl sm:text-3xl">Top by views</h2>
        <ul className="mt-6 divide-y divide-line border-y border-line">
          {data.topSeries.map((s) => (
            <li
              key={s._id}
              className="flex flex-col gap-2 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm">{s.title}</p>
                <p className="text-xs text-muted">
                  {s.type} · {s.status}
                </p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-muted">{s.views} views</span>
                <Link
                  href={`/admin/series/${s._id}`}
                  className="underline underline-offset-4"
                >
                  Manage
                </Link>
              </div>
            </li>
          ))}
          {!data.topSeries.length && (
            <li className="py-4 text-sm text-muted">No series yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
