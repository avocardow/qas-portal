// Tests for CASL proof-of-concept ability definitions
import { defineArticleAbilities, Article } from './caslPoc';

describe('CASL POC', () => {
  const authorUser = { id: 1, isAdmin: false };
  const adminUser = { id: 2, isAdmin: true };

  it('allows read for any user', () => {
    const ability = defineArticleAbilities(authorUser);
    expect(ability.can('read', 'Article')).toBe(true);
  });

  it('allows update own article', () => {
    const ability = defineArticleAbilities(authorUser);
    expect(ability.can('update', new Article(1, false))).toBe(true);
  });

  it('forbids update other articles for non-admin user', () => {
    const ability = defineArticleAbilities(authorUser);
    expect(ability.can('update', new Article(2, false))).toBe(false);
  });

  it('forbids delete for non-admin user', () => {
    const ability = defineArticleAbilities(authorUser);
    expect(ability.can('delete', 'Article')).toBe(false);
  });

  it('allows delete for admin user', () => {
    const ability = defineArticleAbilities(adminUser);
    expect(ability.can('delete', 'Article')).toBe(true);
  });
}); 