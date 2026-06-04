import { describe, it, expect } from 'vitest';
import { formatCurrency, getCurrency } from '@/lib/currencies';

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
