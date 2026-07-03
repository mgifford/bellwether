#!/usr/bin/env node
/**
 * Bellwether snapshot pipeline (spec-001).
 *
 * Converts upstream w3c/sustainableweb-wsg data (guidelines.json, star.json,
 * impact.json) into a dated, identifier-stable, schema-validated snapshot
 * under src/data/wsg/<date>/.
 *
 * Derived success criterion IDs are positional: <section>.<guideline>.<criterion>
 * (e.g. "2.1.1"). Each criterion also carries a content_hash (SHA-256 of
 * normalized title + description) so the diff tool can distinguish rewording
 * from insertion/reordering. See docs/snapshots.md.
 *
 * Usage:
 *   node scripts/snapshot.mjs                 # fetch upstream
 *   node scripts/snapshot.mjs --local <dir>   # use local guidelines.json/star.json/impact.json
 */

import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const UPSTREAM = 'https://raw.githubusercontent.com/w3c/sustainableweb-wsg/main';
const TOOL_VERSION = '0.1.0';

export function normalizeText(s) {
  return String(s ?? '').replace(/\s+/g, ' ').trim();
}

export function contentHash(title, description) {
  return createHash('sha256')
    .update(`${normalizeText(title)}\n${normalizeText(description)}`)
    .digest('hex');
}

/** Convert upstream guidelines.json into the Bellwether snapshot shape. */
export function buildGuidelinesSnapshot(upstream) {
  const sections = [];
  for (const cat of upstream.category ?? []) {
    if (!Array.isArray(cat.guidelines)) continue; // skips Introduction
    const sectionNum = Number(cat.id);
    const section = {
      section: sectionNum,
      name: cat.name,
      short_name: cat.shortName ?? cat.name,
      guidelines: [],
    };
    cat.guidelines.forEach((g, gi) => {
      const gid = `${sectionNum}.${gi + 1}`;
      section.guidelines.push({
        id: gid,
        slug: g.id,
        url: g.url,
        title: g.guideline,
        subheading: g.subheading ?? null,
        tags: g.tags ?? [],
        benefits: g.benefits ?? [],
        criteria: (g.criteria ?? []).map((c, ci) => ({
          id: `${gid}.${ci + 1}`,
          position: ci + 1,
          title: c.title,
          description: c.description,
          resources: c.resources ?? [],
          content_hash: contentHash(c.title, c.description),
        })),
      });
    });
    sections.push(section);
  }
  return sections;
}

/**
 * Link STAR techniques to guidelines by parsing the WSG anchor out of the
 * applicability text and matching it against guideline slugs. Linkage is
 * guideline-level: upstream applicability points at guidelines, not
 * individual success criteria. Unlinked techniques are reported, not dropped.
 */
export function buildStarSnapshot(star, guidelineSections) {
  const bySlug = new Map();
  for (const s of guidelineSections) {
    for (const g of s.guidelines) bySlug.set(g.slug, g.id);
  }
  const techniques = [];
  const unlinked = [];
  for (const cat of star.category ?? []) {
    for (const t of cat.techniques ?? []) {
      const applicability = String(t.applicability ?? '');
      const anchors = [...applicability.matchAll(/#([a-z0-9-]+)/g)].map((m) => m[1]);
      const levelMatch = applicability.match(/\*\*([A-Za-z]+)\*\*/);
      const guidelineRefs = [...new Set(anchors.map((a) => bySlug.get(a)).filter(Boolean))];
      const entry = {
        id: t.id,
        section: Number(cat.id),
        title: t.title,
        level: levelMatch ? levelMatch[1] : null,
        guideline_refs: guidelineRefs,
        test_count: Array.isArray(t.tests) ? t.tests.length : 0,
        tests: t.tests ?? [],
        test_suite: t.testSuite ?? null,
      };
      techniques.push(entry);
      if (guidelineRefs.length === 0) unlinked.push(t.id);
    }
  }
  return { techniques, unlinked };
}

/**
 * Link impact ratings to guidelines by matching impact.json's guideline URL
 * against guidelines.json's guideline.url (impact.json has no slug/anchor,
 * only the full W3C URL). Unlinked ratings are reported, not dropped.
 */
export function buildImpactSnapshot(impact, guidelineSections) {
  const byUrl = new Map();
  for (const s of guidelineSections) {
    for (const g of s.guidelines) byUrl.set(g.url, g.id);
  }
  const ratings = [];
  const unlinked = [];
  for (const cat of impact.category ?? []) {
    for (const g of cat.guidelines ?? []) {
      const guidelineRef = byUrl.get(g.id) ?? null;
      ratings.push({
        guideline_ref: guidelineRef,
        url: g.id,
        impact_ratings: g.impactRatings,
        points: g.points,
        rationale: g.rationale ?? null,
        metrics: g.metrics ?? [],
      });
      if (!guidelineRef) unlinked.push(g.id);
    }
  }
  return { ratings, unlinked };
}

async function loadUpstream(localDir) {
  if (localDir) {
    return {
      guidelines: JSON.parse(await readFile(join(localDir, 'guidelines.json'), 'utf8')),
      star: JSON.parse(await readFile(join(localDir, 'star.json'), 'utf8')),
      impact: JSON.parse(await readFile(join(localDir, 'impact.json'), 'utf8')),
    };
  }
  const fetchJson = async (name) => {
    const res = await fetch(`${UPSTREAM}/${name}`);
    if (!res.ok) throw new Error(`Upstream fetch failed for ${name}: ${res.status}`);
    return res.json();
  };
  return {
    guidelines: await fetchJson('guidelines.json'),
    star: await fetchJson('star.json'),
    impact: await fetchJson('impact.json'),
  };
}

async function validate(schemaPath, data, label) {
  const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
  const schema = JSON.parse(await readFile(schemaPath, 'utf8'));
  const ok = ajv.validate(schema, data);
  if (!ok) {
    throw new Error(`${label} failed schema validation:\n${ajv.errorsText(ajv.errors, { separator: '\n' })}`);
  }
}

export async function main(argv = process.argv.slice(2)) {
  const localIdx = argv.indexOf('--local');
  const localDir = localIdx >= 0 ? argv[localIdx + 1] : null;
  const { guidelines, star, impact } = await loadUpstream(localDir);

  const date = guidelines.lastModified;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date))) {
    throw new Error(`Upstream lastModified missing or malformed: ${date}`);
  }

  const sections = buildGuidelinesSnapshot(guidelines);
  const { techniques, unlinked } = buildStarSnapshot(star, sections);
  const { ratings, unlinked: impactUnlinked } = buildImpactSnapshot(impact, sections);

  const counts = {
    sections: sections.length,
    guidelines: sections.reduce((n, s) => n + s.guidelines.length, 0),
    criteria: sections.reduce(
      (n, s) => n + s.guidelines.reduce((m, g) => m + g.criteria.length, 0),
      0,
    ),
    star_techniques: techniques.length,
    star_unlinked: unlinked.length,
    impact_ratings: ratings.length,
    impact_unlinked: impactUnlinked.length,
  };

  // Structural surprise guards: fail loudly rather than emit a wrong snapshot.
  if (counts.sections !== 4) throw new Error(`Expected 4 guideline sections, got ${counts.sections}`);
  if (counts.guidelines < 50 || counts.criteria < 150) {
    throw new Error(`Counts implausibly low: ${JSON.stringify(counts)}`);
  }

  const outDir = join(REPO_ROOT, 'src', 'data', 'wsg', date);
  await mkdir(outDir, { recursive: true });

  const meta = {
    snapshot_date: date,
    upstream: {
      repository: 'w3c/sustainableweb-wsg',
      guidelines_last_modified: guidelines.lastModified,
      star_last_modified: star.lastModified,
      impact_last_modified: impact.lastModified,
      edition: guidelines.edition,
    },
    fetched_at: new Date().toISOString(),
    tool_version: TOOL_VERSION,
    counts,
    star_unlinked_techniques: unlinked,
    impact_unlinked_urls: impactUnlinked,
  };

  const guidelinesDoc = { snapshot_date: date, sections };
  const starDoc = { snapshot_date: date, techniques };
  const impactDoc = { snapshot_date: date, ratings };

  await validate(join(REPO_ROOT, 'schemas', 'snapshot-guidelines.schema.json'), guidelinesDoc, 'wsg-guidelines.json');
  await validate(join(REPO_ROOT, 'schemas', 'snapshot-star.schema.json'), starDoc, 'star-techniques.json');
  await validate(join(REPO_ROOT, 'schemas', 'snapshot-impact.schema.json'), impactDoc, 'wsg-impact.json');
  await validate(join(REPO_ROOT, 'schemas', 'snapshot-meta.schema.json'), meta, 'snapshot-meta.json');

  await writeFile(join(outDir, 'wsg-guidelines.json'), JSON.stringify(guidelinesDoc, null, 1));
  await writeFile(join(outDir, 'star-techniques.json'), JSON.stringify(starDoc, null, 1));
  await writeFile(join(outDir, 'wsg-impact.json'), JSON.stringify(impactDoc, null, 1));
  await writeFile(join(outDir, 'snapshot-meta.json'), JSON.stringify(meta, null, 1));

  console.log(`Snapshot ${date} written to ${outDir}`);
  console.log(JSON.stringify(counts));
  if (unlinked.length) {
    console.log(`Unlinked STAR techniques (${unlinked.length}): ${unlinked.join(', ')}`);
  }
  if (impactUnlinked.length) {
    console.log(`Unlinked impact ratings (${impactUnlinked.length}): ${impactUnlinked.join(', ')}`);
  }
  return { outDir, counts };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}
