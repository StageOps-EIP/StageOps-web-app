import { describe, expect, it } from 'vitest';
import { formatEventDateRange, formatEventTimeRange, isValidDate } from './utils';

describe('event date/time formatters', () => {
  it('formats same-day date range as a single date', () => {
    const start = new Date('2026-03-13T12:00:00.000Z');
    const end = new Date('2026-03-13T16:00:00.000Z');

    const result = formatEventDateRange(start, end);
    expect(result).toContain('13');
    expect(result).not.toContain(' – ');
  });

  it('formats multi-day date range with start and end dates', () => {
    const start = new Date('2026-03-13T12:00:00.000Z');
    const end = new Date('2026-03-16T00:00:00.000Z');

    const result = formatEventDateRange(start, end);
    expect(result).toContain('13');
    expect(result).toContain('16');
    expect(result).toContain(' – ');
  });

  it('returns explicit missing labels for invalid end date', () => {
    const start = new Date('2026-03-13T12:00:00.000Z');
    const invalidEnd = new Date(Number.NaN);

    expect(isValidDate(invalidEnd)).toBe(false);
    expect(formatEventDateRange(start, invalidEnd)).toBe('Date de fin manquante');
    expect(formatEventTimeRange(start, invalidEnd)).toBe('Horaire de fin manquant');
  });
});

