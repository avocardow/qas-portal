import { canReadArticle, canUpdateArticle, canDeleteArticle } from './permissionService';
import { Article } from './caslPoc';

describe('Permission Service', () => {
  const user = { id: 1, isAdmin: false };
  const admin = { id: 2, isAdmin: true };
  const ownArticle = new Article(1, false);
  const otherArticle = new Article(3, true);

  it('allows read for any user', () => {
    expect(canReadArticle(user)).toBe(true);
    expect(canReadArticle(admin)).toBe(true);
  });

  it('allows update own article', () => {
    expect(canUpdateArticle(user, ownArticle)).toBe(true);
  });

  it('forbids update other user article', () => {
    expect(canUpdateArticle(user, otherArticle)).toBe(false);
  });

  it('forbids delete for non-admin users', () => {
    expect(canDeleteArticle(user)).toBe(false);
  });

  it('allows delete for admin users', () => {
    expect(canDeleteArticle(admin)).toBe(true);
  });
}); 