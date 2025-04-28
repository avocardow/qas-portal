// Tests for AccessControl proof-of-concept grant definitions
import { canReadAny, canUpdateOwn, canDeleteAny } from './accessControlPoc';

describe('AccessControl POC', () => {
  it('allows read any for both user and admin', () => {
    expect(canReadAny('user')).toBe(true);
    expect(canReadAny('admin')).toBe(true);
  });

  it('allows update own for user role', () => {
    expect(canUpdateOwn('user')).toBe(true);
  });

  it('forbids delete any for user role', () => {
    expect(canDeleteAny('user')).toBe(false);
  });

  it('allows delete any for admin role', () => {
    expect(canDeleteAny('admin')).toBe(true);
  });
}); 