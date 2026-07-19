"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CoverPicker, WordCount } from "@/components/PublishFields";
import { StatusToggle } from "@/components/StatusToggle";
import { API_URL, type Series } from "@/lib/api";

export default function PublishPage() {
  const router = useRouter();
  const [type, setType] = useState<"manga" | "novel">("manga");
  const [status, setStatus] = useState<"published" | "draft">("published");
  const [synopsis, setSynopsis] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isManga = type === "manga";

  return (
    <div className="max-w-3xl">
      <p className="text-xs uppercase tracking-[0.25em] text-muted">Create</p>
      <h1 className="display mt-2 text-4xl sm:text-5xl">Publish</h1>
      <p className="mt-3 max-w-xl text-sm text-muted">
        {isManga
          ? "Create a manga series with a cover, then upload chapter pages as images."
          : "Create a novel with a long synopsis and cover, then write chapters as text."}
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => {
            setType("manga");
            setSynopsis("");
          }}
          className={`min-h-[5.5rem] border px-4 py-4 text-left transition ${
            isManga
              ? "chip-active border-white bg-white"
              : "border-line text-muted hover:border-white hover:text-white"
          }`}
        >
          <span className="block text-sm font-medium">Manga / Comic</span>
          <span
            className={`mt-1 block text-xs leading-relaxed ${
              isManga ? "text-black/60" : "text-muted"
            }`}
          >
            Image pages, comic reading order, chapter galleries
          </span>
        </button>
        <button
          type="button"
          onClick={() => {
            setType("novel");
            setSynopsis("");
          }}
          className={`min-h-[5.5rem] border px-4 py-4 text-left transition ${
            !isManga
              ? "chip-active border-white bg-white"
              : "border-line text-muted hover:border-white hover:text-white"
          }`}
        >
          <span className="block text-sm font-medium">Novel</span>
          <span
            className={`mt-1 block text-xs leading-relaxed ${
              !isManga ? "text-black/60" : "text-muted"
            }`}
          >
            Long synopsis, cover art, chapter manuscripts
          </span>
        </button>
      </div>

      <form
        key={type}
        className="mt-10 space-y-8 border-t border-line pt-10"
        onSubmit={async (e) => {
          e.preventDefault();
          setLoading(true);
          setError("");
          const form = e.currentTarget;
          const fd = new FormData(form);
          fd.set("type", type);
          fd.set("status", status);
          fd.set("description", synopsis);
          try {
            const token = localStorage.getItem("wasi_token");
            const res = await fetch(`${API_URL}/admin/series`, {
              method: "POST",
              headers: token ? { Authorization: `Bearer ${token}` } : {},
              body: fd,
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.message || "Failed");
            const series = data.series as Series;
            router.push(`/admin/series/${series._id}`);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Failed");
          } finally {
            setLoading(false);
          }
        }}
      >
        {isManga ? (
          <>
            <div className="space-y-1">
              <h2 className="display text-2xl">Manga details</h2>
              <p className="text-xs text-muted">
                Keep the blurb short. Readers care about cover + chapters.
              </p>
            </div>

            <label className="block space-y-2">
              <span className="text-xs uppercase tracking-[0.2em] text-muted">
                Title
              </span>
              <input
                name="title"
                required
                placeholder="e.g. Shadow Blade Chronicles"
                className="field"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-xs uppercase tracking-[0.2em] text-muted">
                Short blurb
              </span>
              <textarea
                rows={4}
                maxLength={600}
                placeholder="One short pitch for the catalog card…"
                className="field"
                value={synopsis}
                onChange={(e) => setSynopsis(e.target.value)}
              />
              <p className="text-xs text-muted">{synopsis.length}/600</p>
            </label>

            <label className="block space-y-2">
              <span className="text-xs uppercase tracking-[0.2em] text-muted">
                Tags
              </span>
              <input
                name="tags"
                placeholder="action, shonen, fantasy"
                className="field"
              />
            </label>

            <CoverPicker
              required
              label="Cover"
              hint="Portrait cover works best (about 2:3)."
            />
          </>
        ) : (
          <>
            <div className="space-y-1">
              <h2 className="display text-2xl">Novel details</h2>
              <p className="text-xs text-muted">
                Title first. Then a full synopsis readers can sit with — not a
                tiny caption.
              </p>
            </div>

            <label className="block space-y-2">
              <span className="text-xs uppercase tracking-[0.2em] text-muted">
                Title
              </span>
              <input
                name="title"
                required
                placeholder="e.g. Letters from the Quiet Sea"
                className="field display !text-2xl !tracking-[-0.03em] !leading-tight"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-xs uppercase tracking-[0.2em] text-muted">
                Synopsis
              </span>
              <textarea
                rows={14}
                placeholder="Write the full story pitch: setting, stakes, tone. This sits on the novel page like a book flap — use as many words as you need."
                className="field min-h-[280px] leading-relaxed"
                value={synopsis}
                onChange={(e) => setSynopsis(e.target.value)}
                required
              />
              <WordCount text={synopsis} />
            </label>

            <label className="block space-y-2">
              <span className="text-xs uppercase tracking-[0.2em] text-muted">
                Genres / tags
              </span>
              <input
                name="tags"
                placeholder="romance, literary, mystery"
                className="field"
              />
            </label>

            <CoverPicker
              label="Cover"
              hint="Optional but recommended — book-cover style."
            />
          </>
        )}

        <StatusToggle value={status} onChange={setStatus} />

        {error && <p className="text-sm text-danger">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="btn btn-solid w-full sm:w-auto"
        >
          {loading
            ? "Saving…"
            : isManga
              ? "Create manga series"
              : "Create novel"}
        </button>
      </form>
    </div>
  );
}
