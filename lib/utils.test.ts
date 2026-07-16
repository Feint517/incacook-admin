import { test } from "node:test";
import assert from "node:assert/strict";
import { formatEur, formatEurFromCents } from "./utils.ts";

// Intl fr-FR uses narrow no-break spaces — normalize to plain spaces so the
// expected strings stay readable.
function plain(s: string) {
  return s.replace(/[  ]/g, " ");
}

test("formatEurFromCents converts cents to euros before formatting", () => {
  // The regression this guards: 2500 cents rendered as « 2 500,00 € »
  // (100× too large) instead of « 25,00 € ».
  assert.equal(plain(formatEurFromCents(2500)), "25,00 €");
});

test("formatEurFromCents handles group separators and zero", () => {
  assert.equal(plain(formatEurFromCents(123456)), "1 234,56 €");
  assert.equal(plain(formatEurFromCents(0)), "0,00 €");
});

test("formatEur stays euro-denominated", () => {
  assert.equal(plain(formatEur(1200)), "1 200 €");
  assert.equal(plain(formatEur(25, { cents: true })), "25,00 €");
});
