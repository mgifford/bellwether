#!/usr/bin/env node
/**
 * Validate the sample report against report/finding/evidence schemas, and
 * confirm the automated-check-map-entry schema itself compiles (spec-002).
 */
import Ajv from 'ajv';
import { readFile } from 'node:fs/promises';

async function loadSchema(name) {
  return JSON.parse(await readFile(`schemas/${name}.schema.json`, 'utf8'));
}

const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
ajv.addSchema(await loadSchema('evidence'), 'evidence.schema.json');
ajv.addSchema(await loadSchema('finding'), 'finding.schema.json');
const validateReport = ajv.compile(await loadSchema('report'));

const sample = JSON.parse(await readFile('src/data/samples/sample-report.json', 'utf8'));
let failed = false;

if (!validateReport(sample)) {
  console.error(`sample-report.json: ${ajv.errorsText(validateReport.errors, { separator: '\n' })}`);
  failed = true;
} else {
  console.log('validated sample-report.json against report.schema.json');
}

// The check-map schema has no populated entries yet (mission task 5); just
// confirm it compiles as valid JSON Schema draft-07.
try {
  new Ajv({ allErrors: true, allowUnionTypes: true }).compile(
    await loadSchema('automated-check-map-entry'),
  );
  console.log('automated-check-map-entry.schema.json compiles');
} catch (err) {
  console.error(`automated-check-map-entry.schema.json: ${err.message}`);
  failed = true;
}

process.exit(failed ? 1 : 0);
