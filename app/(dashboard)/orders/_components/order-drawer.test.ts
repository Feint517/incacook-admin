import { test } from "node:test";
import assert from "node:assert/strict";
import { reconciliationProblems, type OrderFinancialsReconciliation } from "./order-drawer.tsx";

// Issue #4 / #21: the order drawer used to render the commission/earnings/
// fee split as independent numbers with no way to notice a broken one —
// this is the pure message-list logic behind the warning banner that now
// surfaces exactly which server-side check failed and its delta.

function clean(): OrderFinancialsReconciliation {
  return {
    isReconciled: true,
    pricingSplitDeltaCents: 0,
    subtotalSplitDeltaCents: 0,
    ledgerBookingDeltaCents: 0,
    reversalInconsistent: false,
  };
}

test("no problems for a fully reconciled order", () => {
  assert.deepEqual(reconciliationProblems(clean()), []);
});

test("not-yet-fulfilled order (ledgerBookingDeltaCents null) is not reported as a problem", () => {
  assert.deepEqual(
    reconciliationProblems({ ...clean(), ledgerBookingDeltaCents: null }),
    [],
  );
});

test("reports the pricing-split delta in euros", () => {
  const problems = reconciliationProblems({ ...clean(), pricingSplitDeltaCents: 32 });
  assert.equal(problems.length, 1);
  assert.match(problems[0], /Écart de répartition du prix/);
  assert.match(problems[0], /0,32/); // 32 cents formatted as euros
});

test("reports the subtotal-split delta", () => {
  const problems = reconciliationProblems({ ...clean(), subtotalSplitDeltaCents: 100 });
  assert.equal(problems.length, 1);
  assert.match(problems[0], /commission\/revenu vendeur/);
});

test("reports the ledger-booking delta (D1-shaped: missing platform fee)", () => {
  const problems = reconciliationProblems({ ...clean(), ledgerBookingDeltaCents: 118 });
  assert.equal(problems.length, 1);
  assert.match(problems[0], /Écart portefeuille/);
});

test("reports reversal inconsistency (D5-shaped: orphaned commission)", () => {
  const problems = reconciliationProblems({ ...clean(), reversalInconsistent: true });
  assert.equal(problems.length, 1);
  assert.match(problems[0], /incohérentes/);
});

test("reports every failing check at once, not just the first", () => {
  const problems = reconciliationProblems({
    isReconciled: false,
    pricingSplitDeltaCents: 32,
    subtotalSplitDeltaCents: 100,
    ledgerBookingDeltaCents: 118,
    reversalInconsistent: true,
  });
  assert.equal(problems.length, 4);
});
