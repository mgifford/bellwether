#!/usr/bin/env node
/**
 * Bellwether snapshot diff (spec-001).
 *
 * Compares two snapshots and classifies every success criterion as:
 *   unchanged  same id, same content_hash
 *   reworded   same id, different content_hash
 *   moved      same content_hash found at a different id
 *   added      hash and id both new
 *   removed    present before, no id or hash match after
 *
 * Emits a Markdown migration note. Existing reports pin a snapshot date;
 * this note is what a human reviews before migrating a report forward.
 *
 * Usage: node scripts/diff-snapshots.mjs <oldDir> <newDir> [outFile]
 */

import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

function flatten(doc) {
  const map = new Map(); // id -> {id, hash, title}
  for (const s of doc.sections) {
    for (const g of s.guidelines) {
      for (const c of g.criteria) {
        map.set(c.id, { id: c.id, hash: c.content_hash, title: c.title });
      }
    }
  }
  return map;
}

export function diffSnapshots(oldDoc, newDoc) {
  const oldMap = flatten(oldDoc);
  const newMap = flatten(newDoc);
  const newByHash = new Map();
  for (const c of newMap.values()) {
    if (!newByHash.has(c.hash)) newByHash.set(c.hash, []);
    newByHash.get(c.hash).push(c);
  }

  const result = { unchanged: [], reworded: [], moved: [], added: [], removed: [] };
  const matchedNewIds = new Set();

  for (const oldC of oldMap.values()) {
    const sameId = newMap.get(oldC.id);
    if (sameId && sameId.hash === oldC.hash) {
      result.unchanged.push({ id: oldC.id, title: oldC.title });
      matchedNewIds.add(sameId.id);
      continue;
    }
    const sameHash = (newByHash.get(oldC.hash) ?? []).find((c) => !matchedNewIds.has(c.id));
    if (sameHash) {
      result.moved.push({ from: oldC.id, to: sameHash.id, title: oldC.title });
      matchedNewIds.add(sameHash.id);
      continue;
    }
    if (sameId) {
      result.reworded.push({ id: oldC.id, title: sameId.title, old_title: oldC.title });
      matchedNewIds.add(sameId.id);
      continue;
    }
    result.removed.push({ id: oldC.id, title: oldC.title });
  }

  for (const newC of newMap.values()) {
    if (!matchedNewIds.has(newC.id)) result.added.push({ id: newC.id, title: newC.title });
  }
  return result;
}

export function renderMigrationNote(oldDate, newDate, diff) {
  const lines = [
    `# Migration note: WSG snapshot ${oldDate} to ${newDate}`,
    '',
    'Review this note before migrating any existing report to the new snapshot.',
    'A "moved" criterion keeps its meaning but has a new ID; report findings must',
    'be re-pointed. A "reworded" criterion keeps its ID but its text changed;',
    're-check that recorded findings still apply. "Removed" criteria require an',
    'explicit decision per finding.',
    '',
    `| Change | Count |`,
    `| --- | --- |`,
    `| Unchanged | ${diff.unchanged.length} |`,
    `| Reworded | ${diff.reworded.length} |`,
    `| Moved | ${diff.moved.length} |`,
    `| Added | ${diff.added.length} |`,
    `| Removed | ${diff.removed.length} |`,
    '',
  ];
  const section = (name, rows, fmt) => {
    if (!rows.length) return;
    lines.push(`## ${name}`, '');
    for (const r of rows) lines.push(`- ${fmt(r)}`);
    lines.push('');
  };
  section('Reworded', diff.reworded, (r) => `${r.id}: "${r.old_title}" is now "${r.title}"`);
  section('Moved', diff.moved, (r) => `${r.from} -> ${r.to}: ${r.title}`);
  section('Added', diff.added, (r) => `${r.id}: ${r.title}`);
  section('Removed', diff.removed, (r) => `${r.id}: ${r.title}`);
  return lines.join('\n');
}

async function loadDoc(dir) {
  return JSON.parse(await readFile(join(dir, 'wsg-guidelines.json'), 'utf8'));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [oldDir, newDir, outFile] = process.argv.slice(2);
  if (!oldDir || !newDir) {
    console.error('Usage: node scripts/diff-snapshots.mjs <oldDir> <newDir> [outFile]');
    process.exit(1);
  }
  const [oldDoc, newDoc] = await Promise.all([loadDoc(oldDir), loadDoc(newDir)]);
  const diff = diffSnapshots(oldDoc, newDoc);
  const note = renderMigrationNote(oldDoc.snapshot_date, newDoc.snapshot_date, diff);
  if (outFile) {
    await writeFile(outFile, note);
    console.log(`Migration note written to ${outFile}`);
  } else {
    console.log(note);
  }
}
