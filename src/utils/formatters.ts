import { ThousandSeparator, Locale } from '../types/game';

/**
 * Formats an integer or float with customizable thousand separators.
 * e.g. 2000000 -> "2.000.000" (if separator is '.') or "2,000,000" (if separator is ',')
 */
export function formatNumber(value: number, separator: ThousandSeparator = '.'): string {
  if (isNaN(value)) return '0';
  const isNegative = value < 0;
  const abs = Math.abs(Math.round(value));
  
  // Format with the chosen separator
  const parts = abs.toString().split('');
  let formatted = '';
  let count = 0;
  for (let i = parts.length - 1; i >= 0; i--) {
    formatted = parts[i] + formatted;
    count++;
    if (count % 3 === 0 && i !== 0) {
      formatted = separator + formatted;
    }
  }

  return (isNegative ? '-' : '') + formatted;
}

/**
 * Formats an amount with currency symbol.
 * e.g. formatCurrency(2000000, '€', '.') -> "2.000.000 €"
 *      formatCurrency(2000000, '$', ',') -> "$2,000,000"
 */
export function formatCurrency(
  amount: number,
  symbol: string = '€',
  separator: ThousandSeparator = '.'
): string {
  const formatted = formatNumber(amount, separator);
  if (symbol === '$') {
    return `${symbol}${formatted}`;
  }
  return `${formatted} ${symbol}`;
}

/**
 * Formats a number in compact form for small badges.
 * e.g. 2.000.000 -> "2M" or "2 Mio"
 */
export function formatCompact(amount: number, locale: Locale = 'de'): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (abs >= 1_000_000_000) {
    const val = (abs / 1_000_000_000).toFixed(abs % 1_000_000_000 === 0 ? 0 : 1);
    return `${sign}${val} ${locale === 'de' ? 'Mrd' : 'B'}`;
  }
  if (abs >= 1_000_000) {
    const val = (abs / 1_000_000).toFixed(abs % 1_000_000 === 0 ? 0 : 1);
    return `${sign}${val} ${locale === 'de' ? 'Mio' : 'M'}`;
  }
  if (abs >= 1_000) {
    const val = (abs / 1_000).toFixed(abs % 1_000 === 0 ? 0 : 1);
    return `${sign}${val} k`;
  }
  return `${sign}${abs}`;
}

/**
 * Parses user input strings that might have commas, dots, or unit suffixes.
 * Handles "2", "2.5", "2,5" combined with multiplier units.
 */
export function parseInputToNumber(
  input: string,
  multiplierUnit?: 'k' | 'Tsd' | 'Mio' | 'M' | 'Mrd' | 'B'
): number {
  if (!input || input.trim() === '') return 0;

  // Clean raw string: replace comma with period for float parsing
  let sanitized = input.trim().replace(/\s+/g, '');

  // Detect unit embedded in string if not explicitly passed
  let detectedMultiplier = 1;
  if (!multiplierUnit) {
    if (/(?:mrd|b)$/i.test(sanitized)) {
      detectedMultiplier = 1_000_000_000;
      sanitized = sanitized.replace(/(?:mrd|b)$/i, '');
    } else if (/(?:mio|m)$/i.test(sanitized)) {
      detectedMultiplier = 1_000_000;
      sanitized = sanitized.replace(/(?:mio|m)$/i, '');
    } else if (/(?:k|tsd)$/i.test(sanitized)) {
      detectedMultiplier = 1_000;
      sanitized = sanitized.replace(/(?:k|tsd)$/i, '');
    }
  } else {
    switch (multiplierUnit) {
      case 'k':
      case 'Tsd':
        detectedMultiplier = 1_000;
        break;
      case 'Mio':
      case 'M':
        detectedMultiplier = 1_000_000;
        break;
      case 'Mrd':
      case 'B':
        detectedMultiplier = 1_000_000_000;
        break;
    }
  }

  // Handle dots and commas:
  // If string has both (e.g. 1.500,50 or 1,500.50)
  if (sanitized.includes('.') && sanitized.includes(',')) {
    // If dot comes first, e.g. 1.500,50 (European) -> dot is thousand separator, comma is decimal
    if (sanitized.indexOf('.') < sanitized.indexOf(',')) {
      sanitized = sanitized.replace(/\./g, '').replace(',', '.');
    } else {
      // 1,500.50 (US) -> comma is thousand separator
      sanitized = sanitized.replace(/,/g, '');
    }
  } else if (sanitized.includes(',')) {
    // Single comma: Could be decimal (2,5) or thousand separator (2,000,000)
    // If comma is followed by exactly 3 digits and no other comma/dot, but user is typing 2,5 Mio:
    // When multiplying by detectedMultiplier > 1, 2,5 Mio is 2.5 * 1000000 = 2500000
    sanitized = sanitized.replace(',', '.');
  } else if (sanitized.includes('.')) {
    // If it's something like 2.000.000, multiple dots are thousand separators
    const dotCount = (sanitized.match(/\./g) || []).length;
    if (dotCount > 1) {
      sanitized = sanitized.replace(/\./g, '');
    } else if (dotCount === 1) {
      // If after dot there are 3 digits and detectedMultiplier is 1, it might be 2.000 -> 2000
      // But if detectedMultiplier > 1 (e.g. 2.5 Mio), it's decimal 2.5
      const parts = sanitized.split('.');
      if (detectedMultiplier === 1 && parts[1].length === 3) {
        sanitized = sanitized.replace('.', '');
      }
    }
  }

  const parsed = parseFloat(sanitized);
  if (isNaN(parsed)) return 0;
  return Math.round(parsed * detectedMultiplier);
}

function stripTrailingZeros(numStr: string): string {
  if (numStr.includes('.')) {
    return numStr.replace(/\.?0+$/, '');
  }
  return numStr;
}

/**
 * Returns a human-friendly spoken text description for a number to prevent typo errors.
 * e.g. 2000000 in 'de' -> "2 Millionen"
 *      2500000 in 'en' -> "2.5 Million"
 */
export function numberToWordsPreview(amount: number, locale: Locale = 'de'): string {
  if (!amount || amount === 0) return locale === 'de' ? 'Null' : 'Zero';
  const abs = Math.abs(amount);

  if (abs >= 1_000_000_000) {
    const rawVal = (abs / 1_000_000_000).toFixed(abs % 1_000_000_000 === 0 ? 0 : 2);
    const val = stripTrailingZeros(rawVal);
    const localizedVal = locale === 'de' ? val.replace('.', ',') : val;
    if (locale === 'de') {
      return `${localizedVal} ${parseFloat(val) === 1 ? 'Milliarde' : 'Milliarden'}`;
    }
    return `${localizedVal} ${parseFloat(val) === 1 ? 'Billion' : 'Billion'}`;
  }

  if (abs >= 1_000_000) {
    const rawVal = (abs / 1_000_000).toFixed(abs % 1_000_000 === 0 ? 0 : 2);
    const val = stripTrailingZeros(rawVal);
    const localizedVal = locale === 'de' ? val.replace('.', ',') : val;
    if (locale === 'de') {
      return `${localizedVal} ${parseFloat(val) === 1 ? 'Million' : 'Millionen'}`;
    }
    return `${localizedVal} Million`;
  }

  if (abs >= 1_000) {
    const rawVal = (abs / 1_000).toFixed(abs % 1_000 === 0 ? 0 : 2);
    const val = stripTrailingZeros(rawVal);
    const localizedVal = locale === 'de' ? val.replace('.', ',') : val;
    if (locale === 'de') {
      return `${localizedVal} Tausend`;
    }
    return `${localizedVal} Thousand`;
  }

  return formatNumber(abs, locale === 'de' ? '.' : ',');
}
