#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

// Paths to input and output files
const inputJson = path.resolve(process.cwd(), 'rbac-inventory.json');
const outputCsv = path.resolve(process.cwd(), 'rbac-inventory.csv');
const outputJson = path.resolve(process.cwd(), 'rbac-inventory-enriched.json');

// Verify input exists
if (!fs.existsSync(inputJson)) {
  console.error(`Structured inventory file not found: ${inputJson}`);
  process.exit(1);
}

// Read and parse existing JSON inventory
const raw = fs.readFileSync(inputJson, 'utf-8');
let inventory;
try {
  inventory = JSON.parse(raw);
} catch (err) {
  console.error('Failed to parse JSON inventory:', err);
  process.exit(1);
}

// Helper to derive pattern type
function getPatternType(match) {
  if (match.includes('useRbac')) return 'useRbac';
  if (match.includes('canAccess(')) return 'canAccess';
  if (/import/.test(match)) return 'import';
  if (/export/.test(match)) return 'export';
  if (/return/.test(match)) return 'return';
  return 'unknown';
}

// Enrich inventory entries
const enriched = inventory.map((entry, index) => {
  const { file, line, match } = entry;
  return {
    id: index + 1,
    file,
    line,
    patternType: getPatternType(match),
    match,
    migrationStatus: 'pending',
  };
});

// Write enriched JSON
fs.writeFileSync(outputJson, JSON.stringify(enriched, null, 2));
console.log(`Enriched JSON written to ${outputJson}`);

// Generate CSV header and rows
const headers = ['id', 'file', 'line', 'patternType', 'match', 'migrationStatus'];
const rows = enriched.map(({ id, file, line, patternType, match, migrationStatus }) => {
  // Escape quotes for CSV
  const esc = (str) => `"${String(str).replace(/"/g, '""')}"`;
  return [id, esc(file), line, patternType, esc(match), migrationStatus].join(',');
});
fs.writeFileSync(outputCsv, [headers.join(','), ...rows].join('\n'));
console.log(`CSV report written to ${outputCsv}`); 