/**
 * **The loading state**: where the next reply will appear, while it is on its way.
 *
 * Three dots in the reply's own card, so the reply replaces it in place rather than arriving
 * somewhere else. `role="status"` with "Voilet is replying" for a screen reader; the dots are
 * decorative and stand still under reduced motion (`.tn-typing` in `globals.css`). No percentage and
 * no invented steps: it says a reply is coming and nothing it cannot back.
 */
export function Replying() {
  return (
    <div
      role="status"
      className="tn-message-in mt-[var(--tn-space-2xs)] flex w-fit items-center gap-[5px] rounded-[16px] border border-[var(--store-card-border)] bg-white/75 px-[16px] py-[14px] backdrop-blur-sm"
    >
      <span className="sr-only">Voilet is replying</span>
      {[0, 1, 2].map((d) => (
        <span
          key={d}
          aria-hidden="true"
          className="tn-typing size-[7px] rounded-full bg-[var(--store-primary-40)]"
          style={{ ["--d" as string]: `${d * 160}ms` }}
        />
      ))}
    </div>
  );
}
