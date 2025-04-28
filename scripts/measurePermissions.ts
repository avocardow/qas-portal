#!/usr/bin/env tsx
import { defineArticleAbilities, Article } from '../src/lib/caslPoc';
import { canReadAny, canUpdateOwn, canDeleteAny } from '../src/lib/accessControlPoc';
import { execSync } from 'child_process';

const iterations = 100000;

function measure(label: string, fn: () => void) {
  const start = process.hrtime.bigint();
  for (let i = 0; i < iterations; i++) fn();
  const end = process.hrtime.bigint();
  const durationMs = Number(end - start) / 1e6;
  console.log(`${label}: ${durationMs.toFixed(2)} ms`);
}

console.log('Performance Benchmarks (100,000 iterations)');

// CASL benchmarks
measure('CASL can read', () => {
  const ability = defineArticleAbilities({ id: 1, isAdmin: false });
  ability.can('read', 'Article');
});
measure('CASL can update own', () => {
  const ability = defineArticleAbilities({ id: 1, isAdmin: false });
  ability.can('update', new Article(1, true));
});
measure('CASL can delete (admin)', () => {
  const ability = defineArticleAbilities({ id: 2, isAdmin: true });
  ability.can('delete', 'Article');
});

// AccessControl benchmarks
measure('AC canReadAny (user)', () => {
  canReadAny('user');
});
measure('AC canUpdateOwn (user)', () => {
  canUpdateOwn('user');
});
measure('AC canDeleteAny (admin)', () => {
  canDeleteAny('admin');
});

// Bundle size checks
console.log('\nBundle Sizes');
function getSize(folder: string): string {
  try {
    const out = execSync(`du -sh ${folder}`);
    const [size] = out.toString().split('\t');
    return size;
  } catch {
    return 'N/A';
  }
}
console.log(`CASL size: ${getSize('node_modules/@casl/ability')}`);
console.log(`AccessControl size: ${getSize('node_modules/accesscontrol')}`); 