import { performance } from 'perf_hooks';
import { defineArticleAbilities, Article } from './caslPoc';
import { canReadAny, canUpdateOwn, canDeleteAny } from './accessControlPoc';

describe('Performance and Bundle Size Testing POC', () => {
  const iterations = 10000;
  const user = { id: 1, isAdmin: false };

  it('measures CASL ability build time (avg per build)', () => {
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      defineArticleAbilities(user);
    }
    const end = performance.now();
    console.log(`CASL ability build average: ${((end - start) / iterations).toFixed(4)} ms`);
  });

  it('measures CASL permission check time (avg per check)', () => {
    const ability = defineArticleAbilities(user);
    const testArticle = new Article(1, true);
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      ability.can('update', testArticle);
    }
    const end = performance.now();
    console.log(`CASL permission check average: ${((end - start) / iterations).toFixed(4)} ms`);
  });

  it('measures AccessControl permission check time (avg per check)', () => {
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      canReadAny('user');
      canUpdateOwn('user');
      canDeleteAny('admin');
    }
    const end = performance.now();
    console.log(`AccessControl permission check batch average: ${((end - start) / (iterations * 3)).toFixed(4)} ms`);
  });
}); 