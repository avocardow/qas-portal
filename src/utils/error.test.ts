import { describe, it, expect } from 'vitest';
import { getErrorMessage, to } from './error';

describe('getErrorMessage', () => {
  it('should return message from Error instance', () => {
    const err = new Error('Test error');
    expect(getErrorMessage(err)).toBe('Test error');
  });

  it('should return string directly', () => {
    expect(getErrorMessage('String error')).toBe('String error');
  });

  it('should return generic message for unknown types', () => {
    expect(getErrorMessage({})).toBe('An unexpected error occurred');
    expect(getErrorMessage(123)).toBe('An unexpected error occurred');
  });
});

describe('to', () => {
  it('should resolve to [null, data] on success', async () => {
    const promise = Promise.resolve(42);
    const [err, data] = await to(promise);
    expect(err).toBeNull();
    expect(data).toBe(42);
  });

  it('should resolve to [Error, undefined] on failure', async () => {
    const promise = Promise.reject(new Error('Fail'));  
    const [err, data] = await to(promise);
    expect(err).toBeInstanceOf(Error);
    expect(err?.message).toBe('Fail');
    expect(data).toBeUndefined();
  });

  it('should wrap non-Error rejections', async () => {
    const promise: Promise<unknown> = Promise.reject('string error');
    const [err, data] = await to(promise);
    expect(err).toBeInstanceOf(Error);
    expect(err?.message).toBe('string error');
    expect(data).toBeUndefined();
  });
}); 