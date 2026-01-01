import type { Hex } from '../global/types';

export function prefixHex(value: Hex, operation: 'add' | 'remove'): Hex {
  if (operation === 'add') {
    return `#${value}`;
  } else {
    return value.replace(/^#/, '') as Hex;
  }
}
