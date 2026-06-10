import { describe, it, expect } from 'vitest';
import { getMonthlyEquivalent, getNextDueDate } from '@/lib/utils';

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

describe('getNextDueDate', () => {
  // Use a past start date so the function must advance to the future
  const pastStart = '2020-01-01';
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  it('returns a future date for monthly frequency', () => {
    const next = getNextDueDate(pastStart, 'monthly');
    expect(next >= today).toBe(true);
  });
  it('returns a future date for weekly frequency', () => {
    const next = getNextDueDate(pastStart, 'weekly');
    expect(next >= today).toBe(true);
  });
  it('returns a future date for fortnightly frequency', () => {
    const next = getNextDueDate(pastStart, 'fortnightly');
    expect(next >= today).toBe(true);
  });
  it('returns a future date for quarterly frequency', () => {
    const next = getNextDueDate(pastStart, 'quarterly');
    expect(next >= today).toBe(true);
  });
  it('returns a future date for semi-annual frequency', () => {
    const next = getNextDueDate(pastStart, 'semi-annual');
    expect(next >= today).toBe(true);
  });
  it('returns a future date for annual frequency', () => {
    const next = getNextDueDate(pastStart, 'annual');
    expect(next >= today).toBe(true);
  });
});
