import { describe, it, expect } from 'vitest';
import {
  formatNumber,
  formatCurrency,
  parseInputToNumber,
  numberToWordsPreview,
  formatCompact,
} from '../src/utils/formatters';

describe('formatters', () => {
  it('formats large numbers with dot thousand separator', () => {
    expect(formatNumber(2000000, '.')).toBe('2.000.000');
    expect(formatNumber(15000000, '.')).toBe('15.000.000');
    expect(formatNumber(500, '.')).toBe('500');
    expect(formatNumber(0, '.')).toBe('0');
    expect(formatNumber(-2000000, '.')).toBe('-2.000.000');
  });

  it('formats large numbers with comma thousand separator', () => {
    expect(formatNumber(2000000, ',')).toBe('2,000,000');
    expect(formatNumber(15000000, ',')).toBe('15,000,000');
  });

  it('formats currency correctly', () => {
    expect(formatCurrency(2000000, '€', '.')).toBe('2.000.000 €');
    expect(formatCurrency(2000000, '$', ',')).toBe('$2,000,000');
  });

  it('parses shortcut units with integer input', () => {
    expect(parseInputToNumber('2', 'Mio')).toBe(2000000);
    expect(parseInputToNumber('2', 'M')).toBe(2000000);
    expect(parseInputToNumber('500', 'k')).toBe(500000);
    expect(parseInputToNumber('1', 'Mrd')).toBe(1000000000);
    expect(parseInputToNumber('1', 'B')).toBe(1000000000);
  });

  it('parses shortcut units with decimal input', () => {
    expect(parseInputToNumber('2.5', 'Mio')).toBe(2500000);
    expect(parseInputToNumber('2,5', 'Mio')).toBe(2500000);
    expect(parseInputToNumber('0.5', 'Mio')).toBe(500000);
  });

  it('parses embedded unit strings directly', () => {
    expect(parseInputToNumber('2Mio')).toBe(2000000);
    expect(parseInputToNumber('2 Mio')).toBe(2000000);
    expect(parseInputToNumber('200k')).toBe(200000);
    expect(parseInputToNumber('1.5M')).toBe(1500000);
    expect(parseInputToNumber('2.000.000')).toBe(2000000);
  });

  it('produces correct human readable text preview in German and English', () => {
    expect(numberToWordsPreview(2000000, 'de')).toBe('2 Millionen');
    expect(numberToWordsPreview(2000000, 'en')).toBe('2 Million');
    expect(numberToWordsPreview(2500000, 'de')).toBe('2,5 Millionen');
    expect(numberToWordsPreview(2500000, 'en')).toBe('2.5 Million');
    expect(numberToWordsPreview(500000, 'de')).toBe('500 Tausend');
    expect(numberToWordsPreview(500000, 'en')).toBe('500 Thousand');
    expect(numberToWordsPreview(0, 'de')).toBe('Null');
  });

  it('formats compact representation', () => {
    expect(formatCompact(2000000, 'de')).toBe('2 Mio');
    expect(formatCompact(2000000, 'en')).toBe('2 M');
    expect(formatCompact(500000, 'de')).toBe('500 k');
  });
});
