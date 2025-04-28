// Creating CASL proof-of-concept ability definitions
import { AbilityBuilder, Ability } from '@casl/ability';

export interface User {
  id: number;
  isAdmin: boolean;
}

export class Article {
  constructor(public authorId: number, public published: boolean) {}
}

export function defineArticleAbilities(user: User): Ability {
  const { can, cannot, build } = new AbilityBuilder(Ability);
  can('read', 'Article');
  can('update', 'Article', { authorId: user.id });
  if (user.isAdmin) {
    can('delete', 'Article');
  } else {
    cannot('delete', 'Article');
  }
  return build();
} 