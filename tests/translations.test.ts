import { describe, it, expect } from 'vitest';
import { en, de } from '../src/i18n/translations';

describe('translations parity', () => {
  function getKeys(obj: Record<string, unknown>, prefix = ''): string[] {
    let keys: string[] = [];
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      const fullPath = prefix ? `${prefix}.${key}` : key;
      if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
        keys = keys.concat(getKeys(val as Record<string, unknown>, fullPath));
      } else {
        keys.push(fullPath);
      }
    }
    return keys;
  }

  it('ensures German has all keys present in English', () => {
    const enKeys = getKeys(en as unknown as Record<string, unknown>).sort();
    const deKeys = getKeys(de as unknown as Record<string, unknown>).sort();

    const missingInDe = enKeys.filter(k => !deKeys.includes(k));
    const extraInDe = deKeys.filter(k => !enKeys.includes(k));

    expect(missingInDe).toEqual([]);
    expect(extraInDe).toEqual([]);
  });

  it('ensures no empty translations exist in de or en', () => {
    function checkNotEmpty(obj: Record<string, unknown>, lang: string) {
      for (const [key, val] of Object.entries(obj)) {
        if (typeof val === 'string') {
          expect(val.trim().length, `Empty translation for key ${key} in ${lang}`).toBeGreaterThan(0);
        } else if (typeof val === 'object' && val !== null) {
          checkNotEmpty(val as Record<string, unknown>, lang);
        }
      }
    }

    checkNotEmpty(en as unknown as Record<string, unknown>, 'en');
    checkNotEmpty(de as unknown as Record<string, unknown>, 'de');
  });
});
