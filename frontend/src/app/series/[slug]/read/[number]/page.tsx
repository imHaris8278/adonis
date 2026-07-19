"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api, type Chapter, type Series } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

type ReadPayload = {
  series: Pick<Series, "title" | "slug" | "type"> & { id: string };
  chapter: Chapter;
  chapters: { number: number; title: string }[];
};

export default function ReaderPage() {
  const params = useParams<{ slug: string; number: string }>();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<ReadPayload | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace(
        `/login?next=${encodeURIComponent(
          `/series/${params.slug}/read/${params.number}`
        )}`
      );
      return;
    }

    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const payload = await api<ReadPayload>(
          `/series/${params.slug}/chapters/${params.number}`
        );
        if (!cancelled) {
          setData(payload);
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load");
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user, params.slug, params.number, router]);

  if (authLoading) {
    return <p className="px-4 py-16 text-sm text-muted sm:px-5 md:px-8">Loading…</p>;
  }
  if (!user) {
    return (
      <p className="px-4 py-16 text-sm text-muted sm:px-5 md:px-8">
        Redirecting to login…
      </p>
    );
  }
  if (loading) {
    return <p className="px-4 py-16 text-sm text-muted sm:px-5 md:px-8">Loading…</p>;
  }
  if (error || !data) {
    return (
      <p className="px-4 py-16 text-sm text-danger sm:px-5 md:px-8">
        {error || "Not found"}
      </p>
    );
  }

  const currentIndex = data.chapters.findIndex(
    (c) => c.number === data.chapter.number
  );
  const prev = currentIndex > 0 ? data.chapters[currentIndex - 1] : null;
  const next =
    currentIndex >= 0 && currentIndex < data.chapters.length - 1
      ? data.chapters[currentIndex + 1]
      : null;

  const nav = (
    <div className="flex gap-4 text-sm">
      {prev ? (
        <Link
          href={`/series/${data.series.slug}/read/${prev.number}`}
          className="min-h-11 underline underline-offset-4"
        >
          Prev
        </Link>
      ) : (
        <span className="text-muted">Prev</span>
      )}
      {next ? (
        <Link
          href={`/series/${data.series.slug}/read/${next.number}`}
          className="min-h-11 underline underline-offset-4"
        >
          Next
        </Link>
      ) : (
        <span className="text-muted">Next</span>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-8 sm:px-5 md:px-8 md:pb-10 md:pt-10">
      <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div className="min-w-0">
          <Link
            href={`/series/${data.series.slug}`}
            className="text-xs uppercase tracking-[0.2em] text-muted hover:text-white"
          >
            {data.series.title}
          </Link>
          <h1 className="display mt-2 text-3xl sm:text-4xl md:text-5xl">
            Ch. {data.chapter.number} — {data.chapter.title}
          </h1>
        </div>
        <div className="hidden sm:block">{nav}</div>
      </div>

      {data.series.type === "manga" ? (
        <div className="-mx-4 sm:mx-0">
          {(data.chapter.pages || [])
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((page, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={`${page.imageUrl}-${i}`}
                src={page.imageUrl}
                alt={`Page ${i + 1}`}
                className="manga-page"
              />
            ))}
        </div>
      ) : (
        <article className="novel-prose px-0">{data.chapter.content}</article>
      )}

      <div className="fixed right-0 bottom-0 left-0 z-30 flex items-center justify-between border-t border-line bg-black/90 px-4 py-3 backdrop-blur-md sm:hidden">
        {nav}
        <Link
          href={`/series/${data.series.slug}`}
          className="text-sm text-muted hover:text-white"
        >
          Chapters
        </Link>
      </div>
    </div>
  );
}
