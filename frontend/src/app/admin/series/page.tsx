"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, type Series } from "@/lib/api";

export default function AdminSeriesListPage() {
  const [series, setSeries] = useState<Series[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await api<{ series: Series[] }>("/admin/series");
        setSeries(data.series);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-muted">
            Library
          </p>
          <h1 className="display mt-2 text-4xl sm:text-5xl">All series</h1>
        </div>
        <Link href="/admin/publish" className="btn btn-solid w-full sm:w-auto">
          Publish new
        </Link>
      </div>

      {loading && <p className="mt-6 text-sm text-muted">Loading…</p>}
      {error && <p className="mt-6 text-sm text-danger">{error}</p>}

      {!loading && !error && (
        <ul className="mt-8 divide-y divide-line border-y border-line sm:mt-10">
          {series.map((s) => (
            <li
              key={s._id}
              className="flex flex-col gap-2 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm">{s.title}</p>
                <p className="text-xs text-muted">
                  {s.type} · {s.status} · {s.chapterCount || 0} chapters ·{" "}
                  {s.views} views
                </p>
              </div>
              <Link
                href={`/admin/series/${s._id}`}
                className="text-sm underline underline-offset-4"
              >
                Manage
              </Link>
            </li>
          ))}
          {!series.length && (
            <li className="py-4 text-sm text-muted">No series yet.</li>
          )}
        </ul>
      )}
    </div>
  );
}
