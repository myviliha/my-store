/** `cn` from `@viliha/vui-core`, inlined: it is this, and the package was not worth shipping for it. */
function cn(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

/**
 * The VOILET wordmark, exactly as the Figma file draws it (`SD-200`).
 *
 * **The V is drawn, not typed.** Two traced glyphs overlay each other and the remaining five letters
 * are set type, which is why this is a component rather than a string: "VOILET" in Plus Jakarta Sans
 * would render a different V.
 *
 * **One grid cell, three children, offset by margin.** The file composes it that way rather than
 * with absolute positioning, so all three occupy `col-1 row-1` and the offsets below are the
 * canvas's own. The outer glyph is flat `#0058EE`; the inner one carries a gradient to `#003288`.
 *
 * **Two sizes, both literal.** The small one is the footer's on tablet and mobile. Every number here
 * is transcribed rather than derived: they are within a rounding error of a uniform 0.7557 scale,
 * and a scale factor reproduces them to within 0.66px rather than exactly.
 */

const OUTER = {
  w: 49.3482,
  h: 46.3604,
  d: "M6.29212 0.131257C5.63841 0.28705 3.56685 1.27784 2.75057 1.8252C1.52885 2.64431 0.560543 4.02027 0.162772 5.50248C-0.0582664 6.32604 -0.0535165 7.76211 0.172951 8.60477C0.332718 9.19915 1.37422 11.3368 4.3529 17.1845C6.67535 21.744 8.515 25.3662 10.6061 29.4968C11.7398 31.7362 12.9184 34.0484 13.2252 34.6349C14.3738 36.8308 16.3021 41.1128 16.7269 41.6919C16.9656 42.0175 18.4163 44.5152 19.3865 45.2468C20.2233 45.8777 22.7487 46.3603 23.5067 46.3603C23.5067 46.3603 26.4765 46.3985 28.0018 45.2468C28.9818 44.507 28.6924 44.9787 36.1484 31.9689C37.3861 29.8094 39.163 26.712 40.0972 25.0857C44.855 16.8028 45.7637 15.219 47.2716 12.5821C48.1702 11.0106 48.9715 9.5055 49.0521 9.23745C49.6177 7.35852 49.3653 5.37316 48.3611 3.8034C47.8422 2.99234 46.9939 2.2413 45.7978 1.53446C43.6753 0.28007 43.22 0.127864 41.5807 0.124762C40.4031 0.122435 39.6844 0.276677 38.7692 0.72806C38.1862 1.0156 37.1105 1.89704 36.7182 2.40872C36.497 2.69733 35.5773 4.22037 34.6746 5.79332C33.7718 7.36628 32.2045 10.0929 31.1917 11.8525C30.1788 13.6121 28.4857 16.5568 27.4291 18.3964C24.4693 23.5499 24.0609 24.2317 23.985 24.1467C23.9462 24.1032 23.1395 22.5408 22.1922 20.6746C21.2451 18.8084 19.958 16.2781 19.3321 15.0517C18.7062 13.8253 17.5935 11.644 16.8592 10.2044C13.6417 3.89589 13.1806 3.00902 12.9269 2.64256C12.0535 1.38051 10.034 0.313204 9.20139 0.116812C8.46653 -0.0565283 6.94583 -0.0245327 6.29212 0.131257Z",
};

const INNER = {
  w: 34.514,
  h: 46.2357,
  d: "M4.55232 45.122C3.58218 44.3905 2.15588e-06 39.2149 0 37.7814C-1.71413e-07 37.6674 9.63513 23.4251 12.5949 18.2716C13.6515 16.4321 15.3446 13.4873 16.3575 11.7277C17.3703 9.96817 18.9376 7.24154 19.8404 5.66859C20.7432 4.09563 21.6628 2.5726 21.884 2.28399C22.2764 1.77231 23.352 0.890867 23.935 0.603324C24.8502 0.151941 25.569 -0.00230084 26.7465 2.58751e-05C28.3858 0.00312816 28.8411 0.155334 30.9637 1.40973C32.1597 2.11656 33.0081 2.86761 33.5269 3.67866C34.5311 5.24842 34.7835 7.23379 34.218 9.11271C34.1373 9.38077 33.336 10.8859 32.4374 12.4574C30.9295 15.0943 30.0209 16.678 25.263 24.9609C24.3288 26.5872 22.5519 29.6847 21.3143 31.8442C13.8582 44.854 14.1476 44.3822 13.1677 45.122C11.6423 46.2738 8.67255 46.2356 8.67255 46.2356C7.91453 46.2356 5.38916 45.753 4.55232 45.122Z",
};

export interface VoiletWordmarkProps {
  /** `lg` is the navigation and the desktop footer, `sm` the tablet and mobile footer, `xs` a rail. */
  size?: "lg" | "sm" | "xs" | "2xs";
  /**
   * The drawn V alone, without the five set letters (`SD-207`).
   *
   * A collapsed rail is 60px wide and the full mark needs about 150, so the choice is a mark or no
   * brand at all. The reference keeps a square mark at 24px and drops only its wordmark, which is
   * what this is for: the V is the part that identifies the product, and the letters are the part
   * that needs the room.
   */
  markOnly?: boolean;
  /**
   * The five set letters' colour. A prop rather than a class, because the letters carry an inline
   * `style` for their size and tracking and an inline declaration beats any class: a caller passing
   * `text-white` would have been silently ignored, which is the expensive kind of ignored. The
   * navigation draws them in `--store-primary-60`; the footer draws them white on `#00112d`.
   */
  lettersColor?: string;
  className?: string;
}

/** Per size: the letters, their tracking and left offset, and each glyph's box. */
const SIZES = {
  lg: {
    text: 50.829,
    tracking: 1.0166,
    ml: 52.43,
    outer: { w: 49.348, h: 46.36, mt: 1.6, ml: 0 },
    inner: { w: 34.514, h: 46.236, mt: 1.71, ml: 14.89 },
  },
  /**
   * **`2xs` is their `.logo-icon-header { height: 15px }`** (`SD-208`). The reference draws two
   * separate things in its rail header: a 24px square mark and a 15px-tall wordmark. Ours is one
   * component, so the two states take two sizes: `xs` with `markOnly` for the collapsed mark, and
   * this for the expanded wordmark. Every number is `lg` scaled by `15 / 50.829`.
   */
  "2xs": {
    text: 15,
    tracking: 0.3,
    ml: 15.472,
    outer: { w: 14.563, h: 13.681, mt: 0.472, ml: 0 },
    inner: { w: 10.185, h: 13.645, mt: 0.505, ml: 4.394 },
  },
  /*
   * **`xs` is `lg` halved, and it is the only size here that is derived rather than measured**
   * (`SD-206`). The file draws the mark at two sizes and neither is small enough for a rail brand
   * row beside 12px items, where a 46px glyph is taller than three navigation rows. Halving keeps
   * the proportions exact, which is what matters for a mark whose V is drawn rather than typed.
   */
  xs: {
    text: 25.4145,
    tracking: 0.5083,
    ml: 26.215,
    outer: { w: 24.674, h: 23.18, mt: 0.8, ml: 0 },
    inner: { w: 17.257, h: 23.118, mt: 0.855, ml: 7.445 },
  },
  sm: {
    text: 38.418,
    tracking: 0.7684,
    ml: 39.54,
    outer: { w: 37.218, h: 35.116, mt: 1.21, ml: 0 },
    inner: { w: 26.03, h: 35.021, mt: 1.29, ml: 11.23 },
  },
} as const;

export function VoiletWordmark({
  size = "lg",
  lettersColor = "var(--store-primary-60)",
  markOnly = false,
  className,
}: VoiletWordmarkProps) {
  const s = SIZES[size];
  return (
    <span className={cn("grid shrink-0", className)} aria-label="VOILET">
      <svg
        aria-hidden="true"
        className="col-start-1 row-start-1"
        width={s.outer.w}
        height={s.outer.h}
        viewBox={`0 0 ${OUTER.w} ${OUTER.h}`}
        fill="none"
        style={{ marginTop: s.outer.mt, marginLeft: s.outer.ml }}
      >
        <path fillRule="evenodd" clipRule="evenodd" d={OUTER.d} fill="#0058EE" />
      </svg>
      <svg
        aria-hidden="true"
        className="col-start-1 row-start-1"
        width={s.inner.w}
        height={s.inner.h}
        viewBox={`0 0 ${INNER.w} ${INNER.h}`}
        fill="none"
        style={{ marginTop: s.inner.mt, marginLeft: s.inner.ml }}
      >
        <path d={INNER.d} fill="url(#voilet-wordmark-gradient)" />
        <defs>
          <linearGradient
            id="voilet-wordmark-gradient"
            x1="32.9525"
            y1="2.47214"
            x2="3.14145"
            y2="46.2435"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#0058EE" />
            <stop offset="1" stopColor="#003288" />
          </linearGradient>
        </defs>
      </svg>
      {markOnly ? null : (
        <span
          aria-hidden="true"
          className="col-start-1 row-start-1 leading-none"
          style={{
            fontFamily: "var(--store-font-headline)",
            fontWeight: 800,
            fontSize: s.text,
            letterSpacing: s.tracking,
            marginLeft: s.ml,
            color: lettersColor,
          }}
        >
          OILET
        </span>
      )}
    </span>
  );
}
