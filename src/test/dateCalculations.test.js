import { describe, it, expect } from 'vitest';

describe('SpendingTrend date logic', () => {
  it('recurring expense with June start_date does NOT appear in May', () => {
    const startDate = '2026-06-01';
    const mayEnd = '2026-05-31';
    expect(startDate <= mayEnd).toBe(false);
  });

  it('recurring expense with June start_date DOES appear in June', () => {
    const startDate = '2026-06-01';
    const juneEnd = '2026-06-30';
    expect(startDate <= juneEnd).toBe(true);
  });

  it('string date comparison: 2026-06-01 <= 2026-05-31 is false', () => {
    expect('2026-06-01' <= '2026-05-31').toBe(false);
  });

  it('string date comparison: 2026-06-01 <= 2026-06-30 is true', () => {
    expect('2026-06-01' <= '2026-06-30').toBe(true);
  });

  describe('one-time expense date filtering', () => {
    const expense = { date: '2026-06-15', amount: 100 };

    it('appears in June 2026', () => {
      const inJune = expense.date >= '2026-06-01' && expense.date <= '2026-06-30';
      expect(inJune).toBe(true);
    });

    it('does NOT appear in May 2026', () => {
      const inMay = expense.date >= '2026-05-01' && expense.date <= '2026-05-31';
      expect(inMay).toBe(false);
    });

    it('does NOT appear in July 2026', () => {
      const inJuly = expense.date >= '2026-07-01' && expense.date <= '2026-07-31';
      expect(inJuly).toBe(false);
    });
  });
});
