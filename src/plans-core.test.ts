/**
 * The plan invariants (`PD-1246`), run with `pnpm test` (Node's own runner, which reads TypeScript
 * directly). The brief asked for invariants 1, 3, 4 and 5 at least; every one that a function can hold
 * is here. The type-level half of invariant 1 is checked by `pnpm check-types`: the `@ts-expect-error`
 * below fails the type check the day a credit becomes spendable as a build.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { isFree } from "./entitlement-core.ts";
import { ADD_ONS, ENTITLEMENTS, FREE_ALLOWANCE, PLANS, planById } from "./data/plans.ts";
import {
  authorise,
  type Builds,
  builds,
  cancel,
  credits,
  FRAMEWORKS,
  grantsOf,
  meter,
  projectsFor,
  rangeOf,
  rebuildableUntil,
  refundable,
} from "./plans-core.ts";

const day = (iso: string) => new Date(`${iso}T00:00:00Z`);

describe("invariant 1: the four purchasable things never share a balance", () => {
  it("a theme licence grants product access and never credits", () => {
    const grants = grantsOf({ type: "theme-licence", theme: "console", version: "2.1.0" });
    assert.deepEqual(grants.map((g) => g.kind), ["product-access"]);
  });

  it("a credit pack grants credits and never a theme", () => {
    const grants = grantsOf({ type: "agent-credit-pack", credits: credits(100) });
    assert.deepEqual(grants.map((g) => g.kind), ["agent-credits"]);
  });

  it("signing up grants the ability to connect an agent, and nothing else", () => {
    assert.deepEqual(grantsOf({ type: "sign-up" }), [{ kind: "agent-connection" }]);
  });

  it("a subscription grants no credits", () => {
    const kinds = grantsOf({ type: "pro-subscription" }).map((g) => g.kind);
    assert.ok(!kinds.includes("agent-credits"));
  });

  it("builds and credits are different units to the type checker", () => {
    const spend = (b: Builds) => b;
    // @ts-expect-error: a credit is not a build (invariant 1). Fails `check-types` if it ever compiles.
    spend(credits(1));
    assert.ok(true);
  });

  it("the add-ons are separate products, and deployment services has no price", () => {
    assert.deepEqual(ADD_ONS.map((a) => a.kind), ["agent-credits", "deployment-services"]);
    assert.equal(ADD_ONS[1].price, null);
  });
});

describe("invariant 2: deterministic generation is never metered as AI", () => {
  it("a theme build spends builds and no credits", () => {
    assert.deepEqual(meter({ type: "theme-build", projects: 3 }), { builds: builds(3), credits: credits(0) });
  });
  it("an agent message is one run", () => {
    assert.deepEqual(meter({ type: "agent-run" }), { builds: builds(0), credits: credits(1) });
  });
});

describe("invariant 3: one project is one theme in one framework", () => {
  it("each framework is its own project and spends one build", () => {
    const projects = projectsFor("console", ["react", "vue"]);
    assert.deepEqual(projects, [
      { theme: "console", framework: "react" },
      { theme: "console", framework: "vue" },
    ]);
    assert.equal(meter({ type: "theme-build", projects: projects.length }).builds, 2);
  });
  it("asking for the same framework twice is still one project", () => {
    assert.equal(projectsFor("console", ["react", "react"]).length, 1);
  });
  it("there are six frameworks, and every plan offers all of them", () => {
    assert.equal(FRAMEWORKS.length, 6);
    const row = ENTITLEMENTS.find((r) => r.label === "Frameworks");
    for (const plan of PLANS) assert.match(row?.values[plan.id].text ?? "", /^All 6\b/);
  });
});

describe("invariant 4: an update is a release range on a grant", () => {
  const holding = { range: rangeOf("2.1.0") };
  const now = day("2026-10-09");

  it("buy 2.1.0, own 2.x: a later minor and patch are allowed", () => {
    assert.deepEqual(authorise(holding, { theme: "console", version: "2.9.3" }, now), { ok: true });
  });
  it("the next major is refused, naming the pin, never substituted", () => {
    assert.deepEqual(authorise(holding, { theme: "console", version: "3.0.0" }, now), {
      ok: false,
      reason: "new-major",
      pin: "console@3.0.0",
    });
  });
  it("an earlier major was never bought", () => {
    assert.equal(authorise(holding, { theme: "console", version: "1.4.0" }, now).ok, false);
  });
  it("is checked again at job start: a window that closed after the quote refuses the job", () => {
    const release = { theme: "console", version: "2.9.3", supersededAt: day("2024-10-01") };
    assert.equal(authorise(holding, release, day("2026-09-30")).ok, true); // at quote
    assert.deepEqual(authorise(holding, release, day("2026-10-02")), {
      ok: false,
      reason: "rebuild-window-ended",
      pin: "console@2.9.3",
    }); // at job start
  });
});

describe("invariant 5: cancelling a subscription", () => {
  const active = {
    active: true,
    acquiredMajors: [2, 3],
    composition: true,
    newMajors: true,
    allowance: planById("pro-subscription").allowance.builds,
  };
  const after = cancel(active, FREE_ALLOWANCE);

  it("keeps the rebuild rights for majors already acquired", () => {
    assert.deepEqual(after.acquiredMajors, [2, 3]);
  });
  it("stops composition, new majors and the higher allowance", () => {
    assert.equal(after.active, false);
    assert.equal(after.composition, false);
    assert.equal(after.newMajors, false);
    assert.equal(after.allowance, FREE_ALLOWANCE);
    assert.ok(after.allowance < active.allowance);
  });
});

describe("invariant 6: 24 months of rebuildability after a major is superseded", () => {
  it("ends 24 months to the day", () => {
    assert.equal(rebuildableUntil(day("2026-01-15")).toISOString().slice(0, 10), "2028-01-15");
  });
});

describe("invariant 8: refunds end at delivery, not at a date", () => {
  const purchasedAt = day("2026-10-01");
  it("within 30 days and undelivered: refundable, however much was browsed or previewed", () => {
    assert.equal(refundable({ purchasedAt }, day("2026-10-20")), true);
  });
  it("delivered: not refundable, even on day one", () => {
    assert.equal(refundable({ purchasedAt, deliveredAt: day("2026-10-01") }, day("2026-10-01")), false);
  });
  it("after 30 days: not refundable", () => {
    assert.equal(refundable({ purchasedAt }, day("2026-11-02")), false);
  });
});

describe("invariant 9: tier is computed, never stored", () => {
  it("no plan carries a tier field", () => {
    for (const plan of PLANS) assert.ok(!("tier" in plan));
  });
  it("is answered by isFree", () => {
    assert.equal(isFree("voilet"), true);
    assert.equal(isFree("neon"), false);
  });
});

describe("prices are samples", () => {
  it("every plan and add-on price is marked mock", () => {
    for (const plan of PLANS) {
      assert.equal(plan.price.mock, true);
      if (plan.upgrade) assert.equal(plan.upgrade.mock, true);
    }
    for (const addOn of ADD_ONS) if (addOn.price) assert.equal(addOn.price.mock, true);
  });
});
