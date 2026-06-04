import { describe, it, expect } from 'vitest';
import { getMonthlyEquivalent } from '@/lib/utils';

describe('getMonthlyEquivalent', () => {
  it('returns monthly amount as-is', () => {
    expect(getMonthlyEquivalent(1000, 'monthly')).toBe(1000);
  });
  it('calculates weekly to monthly correctly', () => {
    expect(getMonthlyEquivalent(100, 'weekly')).toBeCloseTo(433.33, 1);
  });
  it('calculates fortnightly to monthly correctly', () => {
    expect(getMonthlyEquivalent(500, 'fortnightly')).toBeCloseTo(1083.33, 1);
  });
  it('calculates quarterly to monthly correctly', () => {
    expect(getMonthlyEquivalent(3000, 'quarterly')).toBe(1000);
  });
  it('calculates annual to monthly correctly', () => {
    expect(getMonthlyEquivalent(12000, 'annual')).toBe(1000);
  });
  it('calculates semi-annual to monthly correctly', () => {
    expect(getMonthlyEquivalent(6000, 'semi-annual')).toBe(1000);
  });
});
