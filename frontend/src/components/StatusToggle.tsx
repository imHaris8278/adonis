"use client";

type Status = "published" | "draft";

export function StatusToggle({
  name = "status",
  value,
  onChange,
}: {
  name?: string;
  value: Status;
  onChange: (value: Status) => void;
}) {
  return (
    <div className="space-y-2">
      <span className="block text-xs uppercase tracking-[0.2em] text-muted">
        Status
      </span>
      <input type="hidden" name={name} value={value} />
      <div className="grid grid-cols-2 gap-2">
        {(
          [
            {
              id: "published" as const,
              label: "Published",
              hint: "Visible to readers",
            },
            {
              id: "draft" as const,
              label: "Draft",
              hint: "Hidden from public",
            },
          ] as const
        ).map((opt) => {
          const active = value === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              className={`min-h-[4.5rem] border px-3 py-3 text-left transition ${
                active
                  ? "chip-active border-white bg-white"
                  : "border-line text-muted hover:border-white hover:text-white"
              }`}
            >
              <span className="block text-sm font-medium">{opt.label}</span>
              <span
                className={`mt-1 block text-xs ${
                  active ? "text-black/60" : "text-muted"
                }`}
              >
                {opt.hint}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
