import { describe, it, expect } from 'vitest';
import { formatCurrency, getCurrency, CURRENCIES } from '@/lib/currencies';

describe('formatCurrency', () => {
  it('formats AUD correctly', () => {
    expect(formatCurrency(1000, 'AUD')).toContain('1,000');
  });
  it('handles zero', () => {
    expect(formatCurrency(0, 'AUD')).toContain('0');
  });
  it('handles negative values', () => {
    expect(formatCurrency(-500, 'AUD')).toContain('500');
  });
});

describe('getCurrency', () => {
  it('returns AUD currency object', () => {
    const currency = getCurrency('AUD');
    expect(currency).toBeDefined();
    expect(currency.code).toBe('AUD');
  });
  it('falls back to AUD for unknown currency code', () => {
    // getCurrency falls back to CURRENCIES[0] (AUD) rather than returning undefined
    const fallback = getCurrency('XYZ');
    expect(fallback).toBeDefined();
    expect(fallback.code).toBe('AUD');
  });
});

describe('formatCurrency extended', () => {
  it('INR formatting contains rupee symbol', () => {
    expect(formatCurrency(1000, 'INR')).toContain('₹');
  });
  it('JPY has no decimal places', () => {
    const formatted = formatCurrency(1000, 'JPY');
    expect(formatted).not.toMatch(/\.\d+/);
  });
});

describe('CURRENCIES array integrity', () => {
  it('all currencies have required fields: code, name, symbol', () => {
    for (const c of CURRENCIES) {
      expect(c.code, `${c.code} missing code`).toBeTruthy();
      expect(c.name, `${c.code} missing name`).toBeTruthy();
      expect(c.symbol, `${c.code} missing symbol`).toBeTruthy();
    }
  });
});

describe('getCurrency symbol lookup', () => {
  it('USD returns correct symbol', () => {
    expect(getCurrency('USD').symbol).toBe('$');
  });
  it('GBP returns correct symbol', () => {
    expect(getCurrency('GBP').symbol).toBe('£');
  });
  it('EUR returns correct symbol', () => {
    expect(getCurrency('EUR').symbol).toBe('€');
  });
  it('INR returns correct symbol', () => {
    expect(getCurrency('INR').symbol).toBe('₹');
  });
  it('JPY returns correct symbol', () => {
    expect(getCurrency('JPY').symbol).toBe('¥');
  });
});
