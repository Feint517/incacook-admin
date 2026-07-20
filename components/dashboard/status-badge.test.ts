import { test } from "node:test";
import assert from "node:assert/strict";
import { connectReadinessOf } from "./status-badge.tsx";

// Issue #4 / #12: the Connect-readiness triad (detailsSubmitted /
// chargesEnabled / payoutsEnabled) is rendered for both sellers and
// drivers via this one derivation — DEC-4's rule: payoutsEnabled &&
// detailsSubmitted, chargesEnabled deliberately excluded (IncaCook
// charges buyers on the platform account and transfers earnings out, so
// a connected account that can take charges isn't thereby payable).

test("never started: neither fact submitted", () => {
  assert.equal(
    connectReadinessOf({ stripeDetailsSubmitted: false, stripePayoutsEnabled: false }),
    "not_started",
  );
});

test("pending: details submitted, awaiting Stripe verification before payouts enable", () => {
  assert.equal(
    connectReadinessOf({ stripeDetailsSubmitted: true, stripePayoutsEnabled: false }),
    "pending",
  );
});

test("ready: both details submitted and payouts enabled", () => {
  assert.equal(
    connectReadinessOf({ stripeDetailsSubmitted: true, stripePayoutsEnabled: true }),
    "ready",
  );
});

test("not ready even with payouts enabled, if details were never submitted (shouldn't happen per Stripe's own flow, but the rule is explicit either way)", () => {
  assert.equal(
    connectReadinessOf({ stripeDetailsSubmitted: false, stripePayoutsEnabled: true }),
    "not_started",
  );
});
