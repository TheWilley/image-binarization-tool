import { describe, it, expect } from 'vitest';
import { prefixHex } from './prefixHex';

describe('prefixHex', () => {
  it('should add a # prefix to a hex string', () => {
    expect(prefixHex('ff5733', 'add')).toBe('#ff5733');
    expect(prefixHex('000000', 'add')).toBe('#000000');
  });

  it('should remove a # prefix from a hex string', () => {
    expect(prefixHex('#ff5733', 'remove')).toBe('ff5733');
    expect(prefixHex('#000000', 'remove')).toBe('000000');
  });

  it('should handle strings without a # prefix gracefully', () => {
    expect(prefixHex('ff5733', 'remove')).toBe('ff5733');
  });
});
