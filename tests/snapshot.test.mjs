import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  normalizeText,
  contentHash,
  buildGuidelinesSnapshot,
  buildStarSnapshot,
  buildImpactSnapshot,
} from '../scripts/snapshot.mjs';
import { diffSnapshots, renderMigrationNote } from '../scripts/diff-snapshots.mjs';

const fixture = async (name) =>
  JSON.parse(await readFile(new URL(`./fixtures/${name}`, import.meta.url), 'utf8'));

test('normalizeText collapses whitespace and trims', () => {
  assert.equal(normalizeText('  a\n b\t c  '), 'a b c');
  assert.equal(normalizeText(null), '');
});

test('contentHash is stable under whitespace changes, sensitive to wording', () => {
  const a = contentHash('Impact analysis', 'Review the impacts.');
  const b = contentHash('Impact  analysis', ' Review the\nimpacts. ');
  const c = contentHash('Impact analysis', 'Review the effects.');
  assert.equal(a, b);
  assert.notEqual(a, c);
  assert.match(a, /^[a-f0-9]{64}$/);
});

test('buildGuidelinesSnapshot derives positional IDs and skips Introduction', async () => {
  const upstream = await fixture('upstream-before.json');
  const sections = buildGuidelinesSnapshot(upstream);
  assert.equal(sections.length, 4);
  assert.equal(sections[0].section, 2);
  assert.equal(sections[0].guidelines[0].id, '2.1');
  assert.equal(sections[0].guidelines[0].criteria[0].id, '2.1.1');
  assert.equal(sections[0].guidelines[0].criteria[1].id, '2.1.2');
});

test('buildStarSnapshot links techniques to guidelines via applicability anchors', async () => {
  const upstream = await fixture('upstream-before.json');
  const star = await fixture('star-fixture.json');
  const sections = buildGuidelinesSnapshot(upstream);
  const { techniques, unlinked } = buildStarSnapshot(star, sections);
  assert.equal(techniques.length, 2);
  assert.deepEqual(techniques[0].guideline_refs, ['2.1']);
  assert.equal(techniques[0].level, 'Advisory');
  assert.deepEqual(unlinked, ['orphan-technique']);
});

test('buildImpactSnapshot links ratings to guidelines via URL', async () => {
  const upstream = await fixture('upstream-before.json');
  const impact = await fixture('impact-fixture.json');
  const sections = buildGuidelinesSnapshot(upstream);
  const { ratings, unlinked } = buildImpactSnapshot(impact, sections);
  assert.equal(ratings.length, 2);
  assert.equal(ratings[0].guideline_ref, '2.1');
  assert.equal(ratings[0].points.impactScore, 6);
  assert.deepEqual(unlinked, ['https://www.w3.org/TR/x/#orphan-guideline']);
});

test('diffSnapshots classifies all five change types', async () => {
  const before = buildGuidelinesSnapshot(await fixture('upstream-before.json'));
  const after = buildGuidelinesSnapshot(await fixture('upstream-after.json'));
  const diff = diffSnapshots(
    { snapshot_date: '2026-01-01', sections: before },
    { snapshot_date: '2026-02-01', sections: after },
  );

  // Fixture design (see fixtures/README.md):
  //  2.1.1 untouched                      -> unchanged
  //  2.1.2 description reworded           -> reworded
  //  3.1.1 new criterion inserted first   -> added; old 3.1.1 text now at 3.1.2 -> moved
  //  4.1.2 deleted                        -> removed
  assert.deepEqual(diff.unchanged.map((c) => c.id).sort(), ['2.1.1', '4.1.1', '5.1.1']);
  assert.deepEqual(diff.reworded.map((c) => c.id), ['2.1.2']);
  assert.deepEqual(diff.moved, [
    { from: '3.1.1', to: '3.1.2', title: 'Old dev criterion' },
  ]);
  assert.deepEqual(diff.added.map((c) => c.id), ['3.1.1']);
  assert.deepEqual(diff.removed.map((c) => c.id), ['4.1.2']);
});

test('insertion does not masquerade as mass rewording', async () => {
  const before = buildGuidelinesSnapshot(await fixture('upstream-before.json'));
  const after = buildGuidelinesSnapshot(await fixture('upstream-after.json'));
  const diff = diffSnapshots(
    { snapshot_date: 'a', sections: before },
    { snapshot_date: 'b', sections: after },
  );
  // The shifted criterion is classified moved, not reworded.
  assert.equal(diff.reworded.some((c) => c.id.startsWith('3.')), false);
});

test('renderMigrationNote produces counts table and sections', async () => {
  const before = buildGuidelinesSnapshot(await fixture('upstream-before.json'));
  const after = buildGuidelinesSnapshot(await fixture('upstream-after.json'));
  const diff = diffSnapshots(
    { snapshot_date: '2026-01-01', sections: before },
    { snapshot_date: '2026-02-01', sections: after },
  );
  const note = renderMigrationNote('2026-01-01', '2026-02-01', diff);
  assert.match(note, /# Migration note: WSG snapshot 2026-01-01 to 2026-02-01/);
  assert.match(note, /\| Moved \| 1 \|/);
  assert.match(note, /## Removed/);
});
