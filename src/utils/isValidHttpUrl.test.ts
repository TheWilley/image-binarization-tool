import { describe, it, expect } from 'vitest';
import { isValidHttpUrl } from './isValidHttpUrl';

describe('isValidHttpUrl', () => {
  it('should return true for valid HTTP/HTTPS URLs', () => {
    expect(isValidHttpUrl('http://example.com')).toBe(true);
    expect(isValidHttpUrl('https://example.com')).toBe(true);
    expect(isValidHttpUrl('https://www.google.com')).toBe(true);
  });

  it('should return false for invalid URLs', () => {
    expect(isValidHttpUrl('ftp://example.com')).toBe(false);
    expect(isValidHttpUrl('not-a-url')).toBe(false);
    expect(isValidHttpUrl('example.com')).toBe(false);
  });

  it('should return false for empty or null strings', () => {
    expect(isValidHttpUrl('')).toBe(false);
    expect(isValidHttpUrl(null as unknown as string)).toBe(false);
  });
});
