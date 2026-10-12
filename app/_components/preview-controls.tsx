"use client";

/**
 * **Light, dark and expand, as one pill** (Figma 857:7152): the theme preview's control group, shared
 * by the theme preview and the live Preview drawer (2026-10-12, by request), so both read alike.
 *
 * **The design's selected state** (by request): a dark outline round the whole pill, and inside it a
 * light track (`--store-neutral-20`) clipped to a pill, where the chosen mode is a block of brand blue
 * cut by the track's rounded end rather than a pill of its own. **The size is ours, not the frame's**:
 * 36px high to match the `btn-md` device buttons beside it.
 */
export type Scheme = "light" | "dark";

export function SchemeExpand({
  scheme,
  onScheme,
  onExpand,
  expandLabel = "Open full window",
  expanded,
}: {
  scheme: Scheme;
  onScheme: (scheme: Scheme) => void;
  onExpand: () => void;
  expandLabel?: string;
  /** For a toggle (the theme preview's full screen); omitted where expand opens a dialog. */
  expanded?: boolean;
}) {
  return (
    <div className="flex h-[36px] shrink-0 items-center gap-[6px] rounded-full border border-[var(--store-neutral-100)] bg-white px-[3px]">
      <div role="group" aria-label="Colour scheme" className="flex items-center overflow-clip rounded-full bg-[var(--store-neutral-20)]">
        {(
          [
            { id: "light", label: "Light", icon: "/recipe/sun.svg" },
            { id: "dark", label: "Dark", icon: "/recipe/moon.svg" },
          ] as const
        ).map((m) => (
          <button
            key={m.id}
            type="button"
            aria-pressed={scheme === m.id}
            aria-label={m.label}
            onClick={() => onScheme(m.id)}
            /* Segments of one track, so square-ended: the track's own rounding cuts the outer ends. */
            className={`flex h-[28px] cursor-pointer items-center justify-center px-[10px] transition-colors duration-150 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--store-primary-60)] ${scheme === m.id ? "bg-[var(--store-primary-40)]" : "hover:bg-[var(--store-neutral-30)]"}`}
          >
            {/* biome-ignore lint/performance/noImgElement: the design's 19.5px SVG */}
            <img
              src={m.icon}
              alt=""
              width={19.5158}
              height={19.5158}
              /* The design draws the sun white (for the blue ground) and the moon grey (for white), so
                 both are recoloured by state: white when chosen, grey when not. */
              className={`block size-[16px] brightness-0 ${scheme === m.id ? "invert" : "opacity-50"}`}
            />
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onExpand}
        aria-label={expandLabel}
        aria-pressed={expanded}
        className="btn btn-sm btn-ghost btn-icon h-[28px] w-[28px] px-0"
      >
        {/* biome-ignore lint/performance/noImgElement: the design's 24px SVG */}
        <img src="/recipe/arrows-out.svg" alt="" width={24.3947} height={24.3947} className="block size-[18px] shrink-0" />
      </button>
    </div>
  );
}
