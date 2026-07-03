#!/usr/bin/env node
/** Validate every committed snapshot against the snapshot schemas. */
import Ajv from 'ajv';
import { readFile, readdir } from 'node:fs/promises';

const pairs = [
  ['wsg-guidelines.json', 'snapshot-guidelines'],
  ['star-techniques.json', 'snapshot-star'],
  ['wsg-impact.json', 'snapshot-impact'],
  ['snapshot-meta.json', 'snapshot-meta'],
];

const dirs = await readdir('src/data/wsg');
let failed = false;
for (const d of dirs) {
  for (const [file, schemaName] of pairs) {
    const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
    const schema = JSON.parse(await readFile(`schemas/${schemaName}.schema.json`, 'utf8'));
    const data = JSON.parse(await readFile(`src/data/wsg/${d}/${file}`, 'utf8'));
    if (!ajv.validate(schema, data)) {
      console.error(`${d}/${file}: ${ajv.errorsText(ajv.errors)}`);
      failed = true;
    }
  }
  if (!failed) console.log(`validated snapshot ${d}`);
}
process.exit(failed ? 1 : 0);
