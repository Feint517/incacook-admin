#!/usr/bin/env node

// Test-file discovery + runner. Exists because two things don't work the way
// a package.json one-liner would assume:
//   - `node --test`'s own default file discovery only matches
//     .test.{js,cjs,mjs} — not .ts/.tsx — so a bare `node --test` silently
//     finds nothing in this all-TypeScript repo.
//   - `find ... | xargs node --import tsx --test` (the first attempt) has a
//     silent-false-pass hole: if `find` matches zero files, xargs either
//     no-ops (BSD/macOS) or runs the command once with no file arguments
//     (GNU/Linux, i.e. CI) — and a zero-arg `node --test` falls back to ITS
//     OWN default discovery, which (per the point above) also finds
//     nothing and exits 0. Either way: "no test files" and "all tests
//     passed" become indistinguishable, defeating the whole point of
//     wiring this into CI (issue #4).
//
// Fails loudly instead if discovery comes up empty.

import { readdirSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const ROOTS = ["lib", "app", "components"];
const TEST_FILE = /\.test\.tsx?$/;

function findTestFiles(dir) {
  const found = [];
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return found; // root doesn't exist — fine, just contributes nothing
  }
  for (const entry of entries) {
    if (entry.name === "node_modules") continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      found.push(...findTestFiles(full));
    } else if (TEST_FILE.test(entry.name)) {
      found.push(full);
    }
  }
  return found;
}

const files = ROOTS.flatMap(findTestFiles);

if (files.length === 0) {
  console.error(
    `No test files (*.test.ts / *.test.tsx) found under ${ROOTS.join(", ")}/ — ` +
      "failing loudly rather than reporting a silent pass.",
  );
  process.exit(1);
}

const result = spawnSync("node", ["--import", "tsx", "--test", ...files], {
  stdio: "inherit",
});
process.exit(result.status ?? 1);
