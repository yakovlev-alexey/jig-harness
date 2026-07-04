import { describe, expect, it } from 'vitest';
import { classNames } from './class-names';

describe('classNames', () => {
  it('joins truthy class names with a space', () => {
    expect(classNames('foo', 'bar')).toBe('foo bar');
  });

  it('filters out falsy values', () => {
    expect(classNames('foo', false, null, undefined, 'bar')).toBe('foo bar');
  });

  it('returns an empty string when all parts are falsy', () => {
    expect(classNames(false, null, undefined)).toBe('');
  });
});
