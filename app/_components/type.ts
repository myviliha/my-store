/**
 * The class strings every section of the home page shares, so a size changes in one place.
 *
 * Everything is set in `--store-font-body`, which is Plus Jakarta Sans at weights 400 to 800 (the
 * reference used Inter; the store moved to Jakarta throughout). Sizes are our `--store-*` steps where
 * the value matches the reference's scale; `--tn-text-lg` and `--tn-text-2xl` are the two that
 * have no step of ours (see `globals.css`).
 */
export const FONT = "font-[family-name:var(--store-font-body)]";

/** The reference's section H2 is 20px on a phone and 24px from `md`: `--store-headline-12` and `-11`. */
export const H2 = `${FONT} text-[length:var(--store-headline-12)] font-semibold leading-[1.5] text-[var(--store-neutral-100)] md:text-[length:var(--store-headline-11)]`;

/** The paragraph under an H2: the reference's `lg`, 18px. */
export const LEAD = `${FONT} text-[length:var(--tn-text-lg)] font-normal leading-[1.5] text-[var(--store-neutral-80)]`;

export const BODY_2 = `${FONT} text-[length:var(--store-body-2)] leading-[1.5]`;
export const BODY_3 = `${FONT} text-[length:var(--store-body-3)] leading-[1.5]`;

/** Every section's centred column. The reference caps copy at 850px and wide grids at the page. */
export const SECTION =
  "mx-auto flex w-full flex-col items-center px-[var(--tn-space-sm)] text-center";

/**
 * **One button, declared once** (`SD-225`).
 *
 * Pricing, Upgrade, Generate and the two on the error pages were five buttons with five sums: one
 * took its height from `py-[10px]` on a 1.5 line box, another from `py-[12px]`, and two used class
 * names from the palette this app replaced. The dev set the standard at **30px**, so it is stated
 * here and read from here.
 *
 * `BUTTON` is the box. `BUTTON_PRIMARY` and `BUTTON_SECONDARY` are the two the storefront has; a
 * third would be a decision rather than a class.
 */
export const BUTTON =
  "inline-flex h-[30px] shrink-0 cursor-pointer items-center justify-center gap-[6px] rounded-[8px] px-[12px] text-[length:var(--store-body-2)] font-semibold leading-none transition-colors duration-150";

export const BUTTON_PRIMARY = `${FONT} ${BUTTON} bg-[var(--store-primary-40)] text-white hover:bg-[var(--store-primary-50)] active:bg-[var(--store-primary-60)]`;

export const BUTTON_SECONDARY = `${FONT} ${BUTTON} border border-[var(--store-card-border)] bg-white text-[var(--store-neutral-100)] hover:bg-[var(--store-neutral-30)]`;

/**
 * **The five accents, in the order every section rotates them** (tokens in `globals.css`).
 *
 * Written out whole rather than built from the name, because Tailwind finds classes by reading the
 * source: `bg-[var(--tn-accent-${name}-soft)]` would never be generated. `name` reaches the raw tokens through a CSS variable, `soft` is a tinted ground,
 * `ink` is text or a mark on it, `solid` is a fill, `border` and `hoverSoft` are hover states.
 */
export const ACCENTS = [
  {
    name: "blue",
    soft: "bg-[var(--tn-accent-blue-soft)]",
    ink: "text-[var(--tn-accent-blue-ink)]",
    solid: "bg-[var(--tn-accent-blue-solid)]",
    border: "hover:border-[var(--tn-accent-blue-solid)]",
    hoverSoft: "hover:bg-[var(--tn-accent-blue-soft)]",
  },
  {
    name: "violet",
    soft: "bg-[var(--tn-accent-violet-soft)]",
    ink: "text-[var(--tn-accent-violet-ink)]",
    solid: "bg-[var(--tn-accent-violet-solid)]",
    border: "hover:border-[var(--tn-accent-violet-solid)]",
    hoverSoft: "hover:bg-[var(--tn-accent-violet-soft)]",
  },
  {
    name: "pink",
    soft: "bg-[var(--tn-accent-pink-soft)]",
    ink: "text-[var(--tn-accent-pink-ink)]",
    solid: "bg-[var(--tn-accent-pink-solid)]",
    border: "hover:border-[var(--tn-accent-pink-solid)]",
    hoverSoft: "hover:bg-[var(--tn-accent-pink-soft)]",
  },
  {
    name: "amber",
    soft: "bg-[var(--tn-accent-amber-soft)]",
    ink: "text-[var(--tn-accent-amber-ink)]",
    solid: "bg-[var(--tn-accent-amber-solid)]",
    border: "hover:border-[var(--tn-accent-amber-solid)]",
    hoverSoft: "hover:bg-[var(--tn-accent-amber-soft)]",
  },
  {
    name: "teal",
    soft: "bg-[var(--tn-accent-teal-soft)]",
    ink: "text-[var(--tn-accent-teal-ink)]",
    solid: "bg-[var(--tn-accent-teal-solid)]",
    border: "hover:border-[var(--tn-accent-teal-solid)]",
    hoverSoft: "hover:bg-[var(--tn-accent-teal-soft)]",
  },
] as const;

export const accentAt = (index: number) => ACCENTS[index % ACCENTS.length] ?? ACCENTS[0];
