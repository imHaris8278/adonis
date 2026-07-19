"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api, type Chapter, type Series } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function SeriesPage() {
  const params = useParams<{ slug: string }>();
  const { user, loading: authLoading } = useAuth();
  const [series, setSeries] = useState<Series | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await api<{ series: Series; chapters: Chapter[] }>(
          `/series/${params.slug}`
        );
        if (!cancelled) {
          setSeries(data.series);
          setChapters(data.chapters);
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load");
          setSeries(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params.slug]);

  if (loading || authLoading) {
    return (
      <p className="px-4 py-16 text-sm text-muted sm:px-5 md:px-8">Loading…</p>
    );
  }
  if (error || !series) {
    return (
      <p className="px-4 py-16 text-sm text-danger sm:px-5 md:px-8">
        {error || "Not found"}
      </p>
    );
  }

  const loginNext = `/series/${series.slug}`;
  const isManga = series.type === "manga";

  if (!isManga) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-5 md:px-8 md:py-12">
        <p className="text-xs uppercase tracking-[0.25em] text-muted">Novel</p>
        <h1 className="display mt-4 text-4xl sm:text-6xl md:text-7xl">
          {series.title}
        </h1>

        <div className="mt-8 grid gap-8 sm:grid-cols-[160px_1fr] sm:items-start">
          <div className="mx-auto aspect-[3/4] w-40 overflow-hidden border border-line bg-[#111] sm:mx-0 sm:w-full">
            {series.coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={series.coverUrl}
                alt={series.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-end p-3">
                <span className="display text-xl">{series.title}</span>
              </div>
            )}
          </div>
          <div className="min-w-0">
            {!!series.tags?.length && (
              <p className="text-xs uppercase tracking-[0.15em] text-muted">
                {series.tags.join(" · ")}
              </p>
            )}
            <p className="mt-3 text-xs text-muted">{series.views} views</p>
            {!user && (
              <p className="mt-4 text-sm">
                <Link
                  href={`/login?next=${encodeURIComponent(loginNext)}`}
                  className="underline underline-offset-4"
                >
                  Login
                </Link>{" "}
                to read chapters.
              </p>
            )}
          </div>
        </div>

        <section className="mt-12 border-t border-line pt-10">
          <h2 className="text-xs uppercase tracking-[0.25em] text-muted">
            Synopsis
          </h2>
          <article className="novel-prose mt-5 max-w-none px-0 text-left">
            {series.description || "No synopsis yet."}
          </article>
        </section>

        <section className="mt-14">
          <h2 className="display text-2xl sm:text-3xl">Table of contents</h2>
          <ol className="mt-6 divide-y divide-line border-y border-line">
            {chapters.map((ch) => {
              const href = `/series/${series.slug}/read/${ch.number}`;
              return (
                <li key={ch._id}>
                  <Link
                    href={
                      user
                        ? href
                        : `/login?next=${encodeURIComponent(href)}`
                    }
                    className="flex min-h-14 items-baseline justify-between gap-4 py-4 transition hover:opacity-60"
                  >
                    <span className="min-w-0">
                      <span className="text-muted">{ch.number}.</span>{" "}
                      {ch.title}
                    </span>
                    <span className="shrink-0 text-xs text-muted">
                      {user ? `${ch.views} reads` : "Login"}
                    </span>
                  </Link>
                </li>
              );
            })}
            {!chapters.length && (
              <li className="py-4 text-sm text-muted">No chapters yet.</li>
            )}
          </ol>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-5 md:px-8 md:py-10">
      <div className="grid gap-8 md:grid-cols-[240px_1fr] md:gap-10 lg:grid-cols-[280px_1fr]">
        <div className="mx-auto aspect-[3/4] w-full max-w-xs overflow-hidden border border-line bg-[#111] md:mx-0 md:max-w-none">
          {series.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={series.coverUrl}
              alt={series.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-end p-4">
              <span className="display text-3xl">{series.title}</span>
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.25em] text-muted">Manga</p>
          <h1 className="display mt-3 text-4xl sm:text-5xl md:text-7xl">
            {series.title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
            {series.description || "No blurb yet."}
          </p>
          {!!series.tags?.length && (
            <p className="mt-3 text-xs text-muted">{series.tags.join(" · ")}</p>
          )}
          <p className="mt-4 text-xs text-muted">{series.views} views</p>
          {!user && (
            <p className="mt-6 text-sm">
              <Link
                href={`/login?next=${encodeURIComponent(loginNext)}`}
                className="underline underline-offset-4"
              >
                Login
              </Link>{" "}
              or{" "}
              <Link
                href={`/register?next=${encodeURIComponent(loginNext)}`}
                className="underline underline-offset-4"
              >
                register
              </Link>{" "}
              to read chapters.
            </p>
          )}
        </div>
      </div>

      <div className="mt-12 md:mt-16">
        <h2 className="display text-2xl sm:text-3xl">Chapters</h2>
        <ul className="mt-6 divide-y divide-line border-y border-line">
          {chapters.map((ch) => {
            const href = `/series/${series.slug}/read/${ch.number}`;
            return (
              <li key={ch._id}>
                <Link
                  href={
                    user ? href : `/login?next=${encodeURIComponent(href)}`
                  }
                  className="flex min-h-14 items-center justify-between py-4 transition hover:opacity-60"
                >
                  <span className="min-w-0 pr-3">
                    <span className="block truncate sm:inline">
                      Ch. {ch.number} — {ch.title}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs text-muted">
                    {user ? `${ch.views} views` : "Login to read"}
                  </span>
                </Link>
              </li>
            );
          })}
          {!chapters.length && (
            <li className="py-4 text-sm text-muted">No chapters yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
