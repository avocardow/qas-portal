#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

// Path to structured inventory JSON
const invFile = path.resolve(process.cwd(), 'rbac-inventory.json');
if (!fs.existsSync(invFile)) {
  console.error(`Inventory JSON not found: ${invFile}`);
  process.exit(1);
}

// Read inventory data
const inventory = JSON.parse(fs.readFileSync(invFile, 'utf-8'));

// Aggregate counts by pattern (word before any non-word character)
const counts = {};
inventory.forEach(({ match }) => {
  const m = /^\s*(\w+)/.exec(match);
  const key = m ? m[1] : 'unknown';
  counts[key] = (counts[key] || 0) + 1;
});

// Write summary JSON
const jsonOut = path.resolve(process.cwd(), 'rbac-pattern-summary.json');
fs.writeFileSync(jsonOut, JSON.stringify(counts, null, 2));
console.log(`Generated JSON summary at ${jsonOut}`);

// Write summary Markdown
const mdLines = ['# RBAC Patterns Summary', '', '| Pattern | Count |', '|---|---|'];
for (const [pattern, count] of Object.entries(counts)) {
  mdLines.push(`| ${pattern} | ${count} |`);
}
const mdOut = path.resolve(process.cwd(), 'rbac-pattern-summary.md');
fs.writeFileSync(mdOut, mdLines.join('\n'));
console.log(`Generated Markdown summary at ${mdOut}`); 