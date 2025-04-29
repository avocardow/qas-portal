#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

// Path to raw inventory
const rawFile = path.resolve(process.cwd(), 'rbac-inventory-raw.txt');
if (!fs.existsSync(rawFile)) {
  console.error(`Raw inventory file not found: ${rawFile}`);
  process.exit(1);
}

// Read and parse lines
const content = fs.readFileSync(rawFile, 'utf-8');
const lines = content.split(/\r?\n/).filter(Boolean);

// Structure inventory
const inventory = lines.map(line => {
  const [filePath, lineNum, ...rest] = line.split(':');
  return {
    file: filePath,
    line: parseInt(lineNum, 10),
    match: rest.join(':').trim(),
  };
});

// Write JSON output
const outFile = path.resolve(process.cwd(), 'rbac-inventory.json');
fs.writeFileSync(outFile, JSON.stringify(inventory, null, 2));
console.log(`Generated structured inventory at ${outFile}`); 