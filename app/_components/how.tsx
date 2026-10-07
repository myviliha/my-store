import { H2, LEAD, SECTION } from "./type";

/**
 * "How does it work": an H2, one paragraph, and a bordered frame at the reference's 16px radius
 * where the reference puts its video.
 *
 * **The frame is a token-coloured placeholder.** There is no walkthrough video to point at, and the
 * reference's frame is a `<video>` with a poster. When one exists it replaces the inner block.
 */
export function How() {
  return (
    <section className={`${SECTION} mt-[var(--tn-space-3xl)] gap-[var(--tn-space-sm)]`}>
      <div className="tn-reveal flex max-w-[850px] flex-col gap-[var(--tn-space-2xs)]">
        <h2 className={H2}>How does Voilet turn a description into source you can ship?</h2>
        <p className={LEAD}>
          You describe the admin your business needs. Voilet picks a theme, lays out the screens and
          writes the code in the framework and CSS system you chose. What you download is ordinary
          frontend source: components, pages and tokens you can read, edit and connect to your own
          backend.
        </p>
      </div>
      <div
        className="tn-reveal w-full max-w-[850px] overflow-hidden rounded-[var(--tn-radius-2xl)] border border-[var(--store-neutral-50)]"
        style={{ ["--i" as string]: 1 }}
      >
        <div
          aria-hidden="true"
          className="aspect-video w-full bg-gradient-to-br from-[var(--store-primary-10)] to-[var(--store-primary-30)]"
        />
      </div>
    </section>
  );
}
