#!/usr/bin/env node

// Deterministic agent-board driver.
//
// This is the supervised-loop "brain": it reads .agent-board/board.json, knows
// the dependency DAG (blockedBy), and answers three questions for the loop:
//
//   node scripts/agent-board.mjs next                  -> next buildable task
//   node scripts/agent-board.mjs list                  -> board summary
//   node scripts/agent-board.mjs set-status <id> <col> -> move a task + sync board.md
//
// A task is "buildable" when its status is Backlog or Ready and every task in
// its blockedBy list is Done. Candidates are ordered by priority (P0<P1<P2)
// then by id, so the loop always advances along the critical path.

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BOARD_JSON = path.join(ROOT, '.agent-board', 'board.json');
const BOARD_MD = path.join(ROOT, '.agent-board', 'board.md');

const COLUMNS = ['Backlog', 'Ready', 'In Progress', 'Review', 'Blocked', 'Done'];
const BUILDABLE_FROM = new Set(['Backlog', 'Ready']);

function readBoard() {
  return JSON.parse(readFileSync(BOARD_JSON, 'utf8'));
}

function priorityRank(priority) {
  const match = /P(\d+)/.exec(priority ?? '');
  return match ? Number(match[1]) : 99;
}

function isBuildable(task, byId) {
  if (!BUILDABLE_FROM.has(task.status)) {
    return false;
  }

  return (task.blockedBy ?? []).every((id) => byId.get(id)?.status === 'Done');
}

function nextTask(board) {
  const byId = new Map(board.tasks.map((task) => [task.id, task]));
  const candidates = board.tasks
    .filter((task) => isBuildable(task, byId))
    .sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority) || a.id.localeCompare(b.id));

  return candidates[0] ?? null;
}

function formatLocalDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function syncBoardMd(board) {
  const header = '| Task | Title | Status | Owner | Priority |';
  const lines = readFileSync(BOARD_MD, 'utf8').split('\n');
  const headerIndex = lines.findIndex((line) => line.trim() === header);
  if (headerIndex === -1) {
    return;
  }

  // Replace the contiguous block of `| TASK-... |` rows that follow the
  // header + separator with a freshly rendered table from board.json.
  let end = headerIndex + 2;
  while (end < lines.length && lines[end].trim().startsWith('| TASK-')) {
    end += 1;
  }

  const rows = board.tasks.map(
    (task) => `| ${task.id} | ${task.title} | ${task.status} | ${task.owner} | ${task.priority} |`,
  );
  lines.splice(headerIndex + 2, end - (headerIndex + 2), ...rows);

  const updatedIndex = lines.findIndex((line) => line.startsWith('Updated:'));
  if (updatedIndex !== -1) {
    lines[updatedIndex] = `Updated: ${board.updated}`;
  }

  writeFileSync(BOARD_MD, lines.join('\n'));
}

function syncTaskMd(task, status) {
  // Status lives in three places (board.json, board.md table, and the task
  // file's own `Status:` header). board.json is authoritative; this keeps the
  // task header from drifting out of sync with it.
  const file = path.join(ROOT, task.path);
  const text = readFileSync(file, 'utf8');
  const updated = text.replace(/^Status:.*$/m, `Status: ${status}`);
  if (updated !== text) {
    writeFileSync(file, updated);
  }
}

function setStatus(id, status) {
  if (!COLUMNS.includes(status)) {
    console.error(`Unknown column "${status}". Use one of: ${COLUMNS.join(', ')}`);
    process.exit(1);
  }

  const board = readBoard();
  const task = board.tasks.find((entry) => entry.id === id);
  if (!task) {
    console.error(`Unknown task "${id}".`);
    process.exit(1);
  }

  task.status = status;
  board.updated = formatLocalDate(new Date());
  writeFileSync(BOARD_JSON, `${JSON.stringify(board, null, 2)}\n`);
  syncBoardMd(board);
  syncTaskMd(task, status);
  console.log(`${id} -> ${status}`);
}

function list() {
  const board = readBoard();
  const byId = new Map(board.tasks.map((task) => [task.id, task]));
  for (const task of board.tasks) {
    const flag = isBuildable(task, byId) ? 'BUILDABLE' : '         ';
    const blocked = (task.blockedBy ?? []).join(',') || '-';
    console.log(`${flag}  ${task.id}  ${task.priority}  ${task.status.padEnd(11)}  blockedBy=${blocked}  ${task.title}`);
  }
}

function gitBranchExists(branch) {
  try {
    execFileSync('git', ['rev-parse', '--verify', branch], { cwd: ROOT, stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

const [command, ...rest] = process.argv.slice(2);

switch (command) {
  case 'next': {
    const task = nextTask(readBoard());
    if (!task) {
      console.log('NONE');
      break;
    }
    const branch = `task/${task.id}`;
    console.log(
      JSON.stringify(
        {
          id: task.id,
          title: task.title,
          priority: task.priority,
          path: task.path,
          branch,
          branchExists: gitBranchExists(branch),
        },
        null,
        2,
      ),
    );
    break;
  }
  case 'list':
    list();
    break;
  case 'set-status':
    setStatus(rest[0], rest.slice(1).join(' '));
    break;
  default:
    console.log('Usage: agent-board.mjs <next|list|set-status <id> <column>>');
    process.exit(command ? 1 : 0);
}
