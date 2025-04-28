import type { Ability } from '@casl/ability';
import { defineArticleAbilities, Article } from './caslPoc';

export type User = { id: number; isAdmin: boolean };

/**
 * Returns a CASL Ability for the given user.
 */
export function getAbility(user: User): Ability {
  return defineArticleAbilities(user);
}

/**
 * Checks if the user can read articles.
 */
export function canReadArticle(user: User): boolean {
  return getAbility(user).can('read', 'Article');
}

/**
 * Checks if the user can update the given article.
 */
export function canUpdateArticle(user: User, article: Article): boolean {
  return getAbility(user).can('update', article);
}

/**
 * Checks if the user can delete articles.
 */
export function canDeleteArticle(user: User): boolean {
  return getAbility(user).can('delete', 'Article');
} 