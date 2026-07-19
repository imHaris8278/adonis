"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { MangaPagesPicker, WordCount } from "@/components/PublishFields";
import { StatusToggle } from "@/components/StatusToggle";
import { api, API_URL, type Chapter, type Series } from "@/lib/api";

export default function ManageSeriesPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [series, setSeries] = useState<Series | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [status, setStatus] = useState<"published" | "draft">("published");
  const [chapterBody, setChapterBody] = useState("");

  const load = useCallback(async () => {
    const [{ series: found }, ch] = await Promise.all([
      api<{ series: Series }>(`/admin/series/${params.id}`),
      api<{ chapters: Chapter[] }>(`/admin/series/${params.id}/chapters`),
    ]);
    setSeries(found);
    setChapters(ch.chapters);
    setChapterBody("");
    setStatus("published");
    setFormKey((k) => k + 1);
  }, [params.id]);

  useEffect(() => {
    load().catch((err) =>
      setError(err instanceof Error ? err.message : "Failed")
    );
  }, [load]);

  if (error && !series) return <p className="text-sm text-danger">{error}</p>;
  if (!series) return <p className="text-sm text-muted">Loading…</p>;

  const nextNumber =
    chapters.reduce((max, c) => Math.max(max, c.number), 0) + 1;
  const isManga = series.type === "manga";

  return (
    <div className="max-w-3xl">
      <Link href="/admin/series" className="text-xs text-muted hover:text-white">
        ← All series
      </Link>

      <p className="mt-4 text-xs uppercase tracking-[0.25em] text-muted">
        {isManga ? "Manga series" : "Novel"}
      </p>
      <h1 className="display mt-2 text-3xl sm:text-4xl md:text-5xl">
        {series.title}
      </h1>
      <p className="mt-2 text-sm text-muted">
        {series.views} views · {series.status} · {chapters.length} chapters
      </p>

      {!isManga && series.description && (
        <p className="mt-6 max-h-40 overflow-y-auto whitespace-pre-wrap border border-line p-4 text-sm leading-relaxed text-muted">
          {series.description}
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-2 sm:mt-8 sm:gap-3">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={async () => {
            try {
              setError("");
              await api(`/admin/series/${series._id}`, {
                method: "PATCH",
                body: JSON.stringify({
                  status:
                    series.status === "published" ? "draft" : "published",
                }),
              });
              await load();
              setMsg("Series status updated");
            } catch (err) {
              setError(err instanceof Error ? err.message : "Failed");
            }
          }}
        >
          Mark series as{" "}
          {series.status === "published" ? "draft" : "published"}
        </button>
        <button
          type="button"
          className="btn btn-danger"
          onClick={async () => {
            if (!confirm("Delete this series and all chapters?")) return;
            try {
              await api(`/admin/series/${series._id}`, { method: "DELETE" });
              router.push("/admin/series");
            } catch (err) {
              setError(err instanceof Error ? err.message : "Failed");
            }
          }}
        >
          Delete
        </button>
        {series.status === "published" && (
          <Link href={`/series/${series.slug}`} className="btn btn-ghost">
            View public
          </Link>
        )}
      </div>

      <div className="mt-12 border-t border-line pt-10 sm:mt-14">
        <h2 className="display text-2xl sm:text-3xl">
          {isManga ? "Add manga chapter" : "Write novel chapter"}
        </h2>
        <p className="mt-2 text-sm text-muted">
          {isManga
            ? "Upload every page image for this chapter in order. Large batches are supported."
            : "Paste or write the full chapter manuscript. Long chapters are expected."}
        </p>

        <form
          key={formKey}
          className="mt-6 space-y-6"
          onSubmit={async (e) => {
            e.preventDefault();
            setSaving(true);
            setError("");
            setMsg("");
            const form = e.currentTarget;
            const fd = new FormData(form);
            fd.set("status", status);
            if (!isManga) fd.set("content", chapterBody);
            try {
              const token = localStorage.getItem("wasi_token");
              const res = await fetch(
                `${API_URL}/admin/series/${series._id}/chapters`,
                {
                  method: "POST",
                  headers: token ? { Authorization: `Bearer ${token}` } : {},
                  body: fd,
                }
              );
              const data = await res.json().catch(() => ({}));
              if (!res.ok) throw new Error(data.message || "Failed");
              setMsg(
                isManga ? "Manga chapter uploaded" : "Novel chapter saved"
              );
              await load();
            } catch (err) {
              setError(err instanceof Error ? err.message : "Failed");
            } finally {
              setSaving(false);
            }
          }}
        >
          <label className="block space-y-2">
            <span className="text-xs uppercase tracking-[0.2em] text-muted">
              Chapter title
            </span>
            <input
              name="title"
              required
              placeholder={
                isManga ? "e.g. The First Duel" : "e.g. Chapter One — Arrival"
              }
              className="field"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-xs uppercase tracking-[0.2em] text-muted">
              Chapter number
            </span>
            <input
              name="number"
              type="number"
              min={1}
              required
              defaultValue={nextNumber}
              className="field max-w-[10rem]"
            />
          </label>

          {isManga ? (
            <MangaPagesPicker />
          ) : (
            <label className="block space-y-2">
              <span className="text-xs uppercase tracking-[0.2em] text-muted">
                Manuscript
              </span>
              <textarea
                rows={18}
                required
                placeholder="Write the full chapter here…"
                className="field min-h-[360px] leading-relaxed"
                value={chapterBody}
                onChange={(e) => setChapterBody(e.target.value)}
              />
              <WordCount text={chapterBody} />
            </label>
          )}

          <StatusToggle value={status} onChange={setStatus} />

          <button
            type="submit"
            disabled={saving}
            className="btn btn-solid w-full sm:w-auto"
          >
            {saving
              ? isManga
                ? "Uploading pages…"
                : "Saving chapter…"
              : isManga
                ? "Upload chapter pages"
                : "Publish chapter text"}
          </button>
        </form>
        {msg && <p className="mt-4 text-sm">{msg}</p>}
        {error && <p className="mt-4 text-sm text-danger">{error}</p>}
      </div>

      <div className="mt-12 sm:mt-14">
        <h2 className="display text-2xl sm:text-3xl">
          {isManga ? "Chapters" : "Table of contents"}
        </h2>
        <ul className="mt-6 divide-y divide-line border-y border-line">
          {chapters.map((ch) => (
            <li
              key={ch._id}
              className="flex flex-col gap-2 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm">
                  {isManga ? "Ch." : ""}
                  {isManga ? ` ${ch.number} — ` : `${ch.number}. `}
                  {ch.title}
                </p>
                <p className="text-xs text-muted">
                  {ch.status} · {ch.views} views
                  {isManga && ch.pages?.length
                    ? ` · ${ch.pages.length} pages`
                    : ""}
                  {!isManga && ch.content
                    ? ` · ${ch.content.trim().split(/\s+/).filter(Boolean).length} words`
                    : ""}
                </p>
              </div>
              <button
                type="button"
                className="self-start text-sm text-danger underline underline-offset-4"
                onClick={async () => {
                  if (!confirm("Delete chapter?")) return;
                  try {
                    await api(`/admin/chapters/${ch._id}`, {
                      method: "DELETE",
                    });
                    await load();
                  } catch (err) {
                    setError(err instanceof Error ? err.message : "Failed");
                  }
                }}
              >
                Delete
              </button>
            </li>
          ))}
          {!chapters.length && (
            <li className="py-4 text-sm text-muted">
              {isManga
                ? "No chapters yet — upload your first page set."
                : "No chapters yet — write the opening chapter."}
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
