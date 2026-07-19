import Link from "next/link";
import type { Series } from "@/lib/api";

export function SeriesGrid({ series }: { series: Series[] }) {
  if (!series.length) {
    return (
      <p className="text-sm tracking-wide text-muted">Nothing published yet.</p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-10 lg:grid-cols-3">
      {series.map((item, index) => (
        <Link
          key={item._id}
          href={`/series/${item.slug}`}
          className="group rise-in block"
          style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
        >
          <div className="aspect-[3/4] overflow-hidden border border-line bg-[#111]">
            {item.coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.coverUrl}
                alt={item.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
            ) : (
              <div className="flex h-full items-end p-4">
                <span className="display text-2xl sm:text-3xl">{item.title}</span>
              </div>
            )}
          </div>
          <div className="mt-3 space-y-1 sm:mt-4">
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted">
              {item.type}
            </p>
            <h3 className="display text-xl leading-none transition-opacity group-hover:opacity-70 sm:text-2xl">
              {item.title}
            </h3>
            <p className="text-xs text-muted">{item.views} views</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
