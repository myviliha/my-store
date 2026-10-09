# Standards — page copy

> The content of `apps/web/store/app/standards/page.tsx` as text, for review and for sharing
> (`SD-225`). **Derived, not the source**: the page is the source. If a line changes here it has to
> change there, and the rules below are what a review checks it against.
>
> `<meta>` title: **Standards**
> `<meta>` description: *How Voilet themes are built: requirements to ISO/IEC/IEEE 29148, interfaces
> to WCAG 2.2 AA and ISO 9241, quality measured against ISO/IEC 25010, and releases versioned to
> SemVer 2.0.0.*

---

# Built to standards you can check

Anyone can show you a screenshot. These are the three questions a screenshot cannot answer, and the
evidence for each.

---

## Is it accessible?

Every shipped screen is built to WCAG 2.2 level AA, and the colour contrast is measured rather than
assumed. The ratios are below, computed from the tokens the theme actually renders with.

**49 design-consistency cases, plus an accessibility pass over every route**

## Will an update break my build?

Releases are versioned to Semantic Versioning 2.0.0, and your licence is enforced on the major. You
own the major you bought: every patch and minor inside it, for as long as you want it. A new major is
a new decision, never a surprise.

**Entitlement is checked against the release's parsed major, not a date**

## Is it maintained?

Every change runs a gate of 69 automated checks before it lands, and the result is written to a log
in the repository rather than claimed in a changelog. Defects are classified, and each class has a
probe you can run.

**Twelve defect classes, each with a runnable probe**

---

## What we build to

Each line is a specification we work to, and each one has a check in our pipeline that fails when we
stop.

| Standard | Scope | What it means for your download |
| --- | --- | --- |
| **ISO/IEC/IEEE 29148** | Requirements engineering | Every requirement is a single, verifiable statement with a stated source and its own acceptance check. |
| **WCAG 2.2 level AA** | Interface accessibility | Contrast, focus visibility, target size and keyboard operation, on every shipped screen. |
| **ISO 9241-110 and -112** | Interaction and presentation | Controls behave the same way in every edition, because the class strings come from one shared source. |
| **ISO/IEC 25010** | Product quality model | Functional suitability, reliability and maintainability are measured by the gate, not asserted. |
| **Semantic Versioning 2.0.0** | Releases | A major means a breaking change, and that is what your licence is enforced on. |

---

## The contrast, measured

Computed from the tokens this theme renders with, using the WCAG 2.2 relative-luminance formula. Not
sampled from a screenshot, and not rounded in our favour.

| Pair | Tokens | Measured | AA requires |
| --- | --- | --- | --- |
| Body text on white | neutral-100 on `#ffffff` | **19.56:1** | 4.5:1 |
| Body text on the page | neutral-100 on page ground | **18.75:1** | 4.5:1 |
| Secondary text | neutral-80 on `#ffffff` | **6.58:1** | 4.5:1 |
| Primary button label | `#ffffff` on primary-40 | **5.78:1** | 4.5:1 |
| Primary button, hover | `#ffffff` on primary-50 | **6.80:1** | 4.5:1 |
| Links and the focus ring | primary-40 on `#ffffff` | **5.78:1** | 4.5:1 |
| Control boundaries | control-border on `#ffffff` | **3.69:1** | 3:1 |

---

## What we do not claim

The refusals are the part you can check, so they are on the same page as the claims rather than in a
footnote.

### We are not IEEE or ISO certified

There is no certification scheme for these standards. They are specifications you build to, and that
is what we say: built to, never certified. You will find no IEEE or ISO mark on this site.

### We cannot certify what you build on top

Our screens are AA. If you replace our tokens with a palette that fails contrast, that failure is
real and we cannot prevent it. Every theme ships with its measured ratios so you start from a passing
baseline and can see when you have left it.

### We publish no speed claim we have not measured

Generation time is measured from an approved recipe entering the queue to a validated artifact, with
queue time counted separately. Until that number is measured and reproducible, it does not appear on
this page.

---

## The three rules this copy lives under

From `PD-1235`, and a review may reject the page for any of them.

1. **"Built to", never "certified".** No IEEE or ISO mark appears.
2. **Every clause maps to a row in `odin/engineering/STANDARDS.md`.** A claim with no mechanism
   behind it cannot appear here.
3. **No numeric claim without its basis.** Which is why the five-minute generation figure is absent:
   `B-36` has not measured it yet.

## What is deliberately absent

| Not on the page | Why |
| --- | --- |
| The five-minute generation claim | Not measured yet (`B-36`, and rule 3 above) |
| ISO/IEC/IEEE 1016 and 42010 | Not adopted. Both describe how to document a design, and ours is decision rows plus guards that fail when a document names a path that does not exist |
| An IEEE or ISO logo | There is nothing to be certified by, so a mark would imply one |
| A link to `/docs` | That route is not built since `SD-215`, and a dead link on the page about verifiability is the worst place for one |
