import { describe, test, expect } from '@jest/globals';
import {
  parseIntervalString,
  parseIntervals,
  safeParse,
  parseWithErrors,
  formatIntervals,
  parseRangeNotation
} from '../../src/utils/parsers.js';
import { Interval } from '../../src/core/Interval.js';

describe('Parser Utilities', () => {
  describe('parseIntervalString', () => {
    test('parses basic positive interval', () => {
      const result = parseIntervalString('10-100');
      expect(result.start).toBe(10);
      expect(result.end).toBe(100);
      expect(result).toBeInstanceOf(Interval);
    });

    test('parses negative intervals', () => {
      const result = parseIntervalString('-100--10');
      expect(result.start).toBe(-100);
      expect(result.end).toBe(-10);
    });

    test('parses single point interval', () => {
      const result = parseIntervalString('50-50');
      expect(result.start).toBe(50);
      expect(result.end).toBe(50);
    });

    test('handles whitespace around numbers', () => {
      const result = parseIntervalString(' 10 - 100 ');
      expect(result.start).toBe(10);
      expect(result.end).toBe(100);
    });

    test('parses large numbers', () => {
      const result = parseIntervalString('1000000-2000000');
      expect(result.start).toBe(1000000);
      expect(result.end).toBe(2000000);
    });

    test('throws error for empty string', () => {
      expect(() => parseIntervalString('')).toThrow('Empty interval string');
    });

    test('throws error for invalid format', () => {
      expect(() => parseIntervalString('invalid')).toThrow('Invalid interval format');
      expect(() => parseIntervalString('10')).toThrow('Invalid interval format');
      expect(() => parseIntervalString('10-')).toThrow('Invalid interval format');
      expect(() => parseIntervalString('-100')).toThrow('Invalid interval format');
    });

    test('throws error for non-numeric values', () => {
      expect(() => parseIntervalString('abc-def')).toThrow('Invalid interval format');
      expect(() => parseIntervalString('10-abc')).toThrow('Invalid interval format');
    });

    test('throws error for start > end', () => {
      expect(() => parseIntervalString('100-10')).toThrow('Invalid interval');
    });

    test('handles null and undefined', () => {
      expect(() => parseIntervalString(null)).toThrow('Empty interval string');
      expect(() => parseIntervalString(undefined)).toThrow('Empty interval string');
    });
  });

  describe('parseIntervals', () => {
    test('parses multiple intervals from string', () => {
      const result = parseIntervals('10-100,200-300,400-500');

      expect(result).toHaveLength(3);
      expect(result[0].start).toBe(10);
      expect(result[0].end).toBe(100);
      expect(result[1].start).toBe(200);
      expect(result[1].end).toBe(300);
      expect(result[2].start).toBe(400);
      expect(result[2].end).toBe(500);
    });

    test('parses intervals from array', () => {
      const result = parseIntervals(['10-100', '200-300']);

      expect(result).toHaveLength(2);
      expect(result[0].start).toBe(10);
      expect(result[0].end).toBe(100);
      expect(result[1].start).toBe(200);
      expect(result[1].end).toBe(300);
    });

    test('handles empty string', () => {
      const result = parseIntervals('');

      expect(result).toEqual([]);
    });

    test('handles null and undefined', () => {
      expect(parseIntervals(null)).toEqual([]);
      expect(parseIntervals(undefined)).toEqual([]);
    });

    test('handles whitespace and empty elements', () => {
      const result = parseIntervals('10-100, , 200-300, ');

      expect(result).toHaveLength(2);
      expect(result[0].start).toBe(10);
      expect(result[1].start).toBe(200);
    });

    test('filters out empty strings in array', () => {
      const result = parseIntervals(['10-100', '', '200-300', null]);

      expect(result).toHaveLength(2);
    });

    test('throws error with context for invalid intervals', () => {
      expect(() => parseIntervals('10-100,invalid,200-300')).toThrow('Error parsing interval 2');
    });

    test('handles mixed valid and whitespace-only intervals', () => {
      const result = parseIntervals('10-100,   ,200-300');
      expect(result).toHaveLength(2);
    });
  });

  describe('safeParse', () => {
    test('returns valid result for correct interval', () => {
      const result = safeParse('10-100');

      expect(result.start).toBe(10);
      expect(result.end).toBe(100);
      expect(result.isValid).toBe(true);
    });

    test('returns invalid result for incorrect interval', () => {
      const result = safeParse('invalid');

      expect(result.start).toBe(0);
      expect(result.end).toBe(0);
      expect(result.isValid).toBe(false);
    });

    test('handles empty string and null safely', () => {
      expect(safeParse('').isValid).toBe(false);
      expect(safeParse(null).isValid).toBe(false);
    });
  });

  describe('parseWithErrors', () => {
    test('parses valid intervals and returns no errors', () => {
      const result = parseWithErrors(['10-100', '200-300']);

      expect(result.intervals).toHaveLength(2);
      expect(result.errors).toHaveLength(0);
    });

    test('collects errors for invalid intervals', () => {
      const result = parseWithErrors(['10-100', 'invalid', '200-300', 'bad']);

      expect(result.intervals).toHaveLength(2);
      expect(result.errors).toHaveLength(2);
      expect(result.errors[0]).toContain('Interval 2');
      expect(result.errors[1]).toContain('Interval 4');
    });

    test('handles string input by splitting', () => {
      const result = parseWithErrors('10-100,invalid,200-300');

      expect(result.intervals).toHaveLength(2);
      expect(result.errors).toHaveLength(1);
    });

    test('skips empty intervals', () => {
      const result = parseWithErrors(['10-100', '', '200-300']);

      expect(result.intervals).toHaveLength(2);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('formatIntervals', () => {
    test('formats multiple intervals', () => {
      const intervals = [
        new Interval(10, 100),
        new Interval(200, 300)
      ];
      const result = formatIntervals(intervals);

      expect(result).toBe('10-100, 200-300');
    });

    test('formats single interval', () => {
      const intervals = [new Interval(10, 100)];
      const result = formatIntervals(intervals);

      expect(result).toBe('10-100');
    });

    test('handles empty array', () => {
      const result = formatIntervals([]);

      expect(result).toBe('(none)');
    });
  });

  describe('parseRangeNotation', () => {
    test('converts intervals to range pairs', () => {
      const result = parseRangeNotation('10-100,200-300');

      expect(result).toEqual([[10, 100], [200, 300]]);
    });

    test('handles array input', () => {
      const result = parseRangeNotation(['10-100', '200-300']);

      expect(result).toEqual([[10, 100], [200, 300]]);
    });

    test('handles empty input', () => {
      const result = parseRangeNotation('');

      expect(result).toEqual([]);
    });

    test('handles single interval', () => {
      const result = parseRangeNotation('10-100');

      expect(result).toEqual([[10, 100]]);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('handles very large numbers', () => {
      const result = parseIntervalString('999999999-1000000000');

      expect(result.start).toBe(999999999);
      expect(result.end).toBe(1000000000);
    });

    test('handles zero values', () => {
      const result = parseIntervalString('0-0');

      expect(result.start).toBe(0);
      expect(result.end).toBe(0);
    });

    test('handles negative zero', () => {
      const result = parseIntervalString('-0-0');

      expect(result.start).toBe(-0);
      expect(result.end).toBe(0);
    });

    test('preserves order of parsed intervals', () => {
      const result = parseIntervals('300-400,10-100,200-250');

      expect(result[0].start).toBe(300);
      expect(result[1].start).toBe(10);
      expect(result[2].start).toBe(200);
    });

    test('handles intervals with same start and end', () => {
      const result = parseIntervals('50-50,60-60,70-70');

      expect(result).toHaveLength(3);
      result.forEach((interval, index) => {
        const expected = 50 + (index * 10);
        expect(interval.start).toBe(expected);
        expect(interval.end).toBe(expected);
      });
    });
  });
});
