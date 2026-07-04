import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import Ajv from 'ajv';

const loadSchema = async (name) =>
  JSON.parse(await readFile(new URL(`../schemas/${name}.schema.json`, import.meta.url), 'utf8'));

async function makeFindingValidator() {
  const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
  ajv.addSchema(await loadSchema('evidence'), 'evidence.schema.json');
  return ajv.compile(await loadSchema('finding'));
}

const validFinding = {
  id: 'f1',
  wsg_ref: '2.1.1',
  wsg_guideline: '2.1',
  wsg_title: 'Test',
  wsg_section: 'ux-design',
  testability_level: 'manual-review-required',
  result_status: 'pass',
  evaluation_method: 'manual review',
  evidence: [
    {
      kind: 'manual',
      summary: 'checked',
      confidence: 'high',
      manual: { evaluator: 'me', review_date: '2026-01-01', method: 'inspection' },
    },
  ],
  affected_urls: ['https://example.com'],
  confidence: 'high',
  sensitivity: 'public',
  last_updated: '2026-01-01T00:00:00Z',
  modified_after_import: false,
};

test('finding schema accepts a valid manual-evidence finding', async () => {
  const validate = await makeFindingValidator();
  assert.equal(validate(validFinding), true);
});

test('finding schema allows empty evidence when result_status is not-tested', async () => {
  const validate = await makeFindingValidator();
  assert.equal(validate({ ...validFinding, result_status: 'not-tested', evidence: [] }), true);
});

test('finding schema allows empty evidence when result_status is not-applicable', async () => {
  const validate = await makeFindingValidator();
  assert.equal(validate({ ...validFinding, result_status: 'not-applicable', evidence: [] }), true);
});

test('finding schema rejects empty evidence for a pass result', async () => {
  const validate = await makeFindingValidator();
  assert.equal(validate({ ...validFinding, evidence: [] }), false);
});

test('finding schema rejects a finding missing testability_level', async () => {
  const validate = await makeFindingValidator();
  const { testability_level, ...rest } = validFinding;
  assert.equal(validate(rest), false);
});

test('evidence schema rejects automated kind missing the automated sub-object', async () => {
  const validate = await makeFindingValidator();
  const bad = {
    ...validFinding,
    evidence: [{ kind: 'automated', summary: 'x', confidence: 'high' }],
  };
  assert.equal(validate(bad), false);
});

test('evidence schema rejects manual sub-object missing required fields', async () => {
  const validate = await makeFindingValidator();
  const bad = {
    ...validFinding,
    evidence: [{ kind: 'manual', summary: 'x', confidence: 'high', manual: { evaluator: 'me' } }],
  };
  assert.equal(validate(bad), false);
});

test('report schema validates the sample report end to end', async () => {
  const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
  ajv.addSchema(await loadSchema('evidence'), 'evidence.schema.json');
  ajv.addSchema(await loadSchema('finding'), 'finding.schema.json');
  const validate = ajv.compile(await loadSchema('report'));
  const sample = JSON.parse(
    await readFile(new URL('../src/data/samples/sample-report.json', import.meta.url), 'utf8'),
  );
  assert.equal(validate(sample), true, ajv.errorsText(validate.errors));
});

test('report schema rejects conformance_language_policy_ack: false', async () => {
  const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
  ajv.addSchema(await loadSchema('evidence'), 'evidence.schema.json');
  ajv.addSchema(await loadSchema('finding'), 'finding.schema.json');
  const validate = ajv.compile(await loadSchema('report'));
  const sample = JSON.parse(
    await readFile(new URL('../src/data/samples/sample-report.json', import.meta.url), 'utf8'),
  );
  assert.equal(validate({ ...sample, conformance_language_policy_ack: false }), false);
});

async function makeCheckMapValidator() {
  const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
  return ajv.compile(await loadSchema('automated-check-map-entry'));
}

const validMapping = {
  id: 'm1',
  wsg_ref: '2.1.1',
  wsg_title: 'Test',
  test_name: 'axe-rule',
  test_category: 'accessibility',
  automation_level: 'automatically-tested',
  evidence_required: 'scan result',
  tool_source: 'vital-core',
  scoring_method: 'pass/fail',
  false_positive_risks: 'some',
  false_negative_risks: 'some',
  remediation_guidance: 'fix it',
  advisory_or_blocking: 'advisory',
  human_review_required: true,
  draft: true,
  wsg_version: '2026-07-03',
  map_version: '0.1.0',
  star_technique: 'star-1',
};

test('check-map entry schema accepts a valid entry with a STAR technique', async () => {
  const validate = await makeCheckMapValidator();
  assert.equal(validate(validMapping), true);
});

test('check-map entry schema requires star_absence_rationale when star_technique is null', async () => {
  const validate = await makeCheckMapValidator();
  const { star_technique, ...rest } = validMapping;
  assert.equal(validate({ ...rest, star_technique: null }), false);
  assert.equal(
    validate({ ...rest, star_technique: null, star_absence_rationale: 'no STAR technique covers this' }),
    true,
  );
});

test('check-map entry schema rejects empty false_positive_risks', async () => {
  const validate = await makeCheckMapValidator();
  assert.equal(validate({ ...validMapping, false_positive_risks: '' }), false);
});
