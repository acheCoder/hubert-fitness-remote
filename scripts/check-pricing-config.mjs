import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sourcePath = path.join(__dirname, '..', 'src', 'components', 'ContactForm', 'ContactForm.tsx');
const source = fs.readFileSync(sourcePath, 'utf8');

assert.match(source, /complete_monthly: \{ totalPrice: 50, months: 1, monthlyEquiv: 50/);
assert.match(source, /complete_quarterly: \{ totalPrice: 125, months: 3, monthlyEquiv: 42/);
assert.match(source, /complete_semiannual: \{ totalPrice: 240, months: 6, monthlyEquiv: 40/);
assert.match(source, /const ANCHOR_MONTHLY = 50;/);

console.log('Pricing config regression checks passed');
