import { describe, test, expect } from '@jest/globals';
import { Interval } from '../../src/core/Interval.js';

describe('Interval Class', () => {
  describe('Constructor', () => {
    test('creates valid interval', () => {
      const interval = new Interval(10, 100);

      expect(interval.start).toBe(10);
      expect(interval.end).toBe(100);
    });

    test('rejects invalid interval where start > end', () => {
      expect(() => new Interval(100, 10)).toThrow('Invalid interval');
    });

    test('allows single point interval', () => {
      const interval = new Interval(50, 50);

      expect(interval.start).toBe(50);
      expect(interval.end).toBe(50);
    });

    test('handles negative numbers', () => {
      const interval = new Interval(-100, -10);

      expect(interval.start).toBe(-100);
      expect(interval.end).toBe(-10);
    });
  });

  describe('Overlap Detection', () => {
    test('detects overlapping intervals', () => {
      const i1 = new Interval(10, 50);
      const i2 = new Interval(30, 70);

      expect(i1.overlaps(i2)).toBe(true);
      expect(i2.overlaps(i1)).toBe(true);
    });

    test('detects non-overlapping intervals', () => {
      const i1 = new Interval(10, 20);
      const i2 = new Interval(30, 40);

      expect(i1.overlaps(i2)).toBe(false);
    });

    test('detects adjacent intervals as overlapping', () => {
      const i1 = new Interval(10, 20);
      const i2 = new Interval(20, 30);

      expect(i1.overlaps(i2)).toBe(true);
    });

    test('detects edge touching intervals', () => {
      const i1 = new Interval(10, 19);
      const i2 = new Interval(20, 30);
      
      expect(i1.overlaps(i2)).toBe(false);
    });
  });

  describe('Containment', () => {
    test('detects when interval contains another', () => {
      const i1 = new Interval(10, 100);
      const i2 = new Interval(20, 80);

      expect(i1.contains(i2)).toBe(true);
      expect(i2.contains(i1)).toBe(false);
    });

    test('detects when intervals are equal', () => {
      const i1 = new Interval(10, 50);
      const i2 = new Interval(10, 50);

      expect(i1.contains(i2)).toBe(true);
      expect(i2.contains(i1)).toBe(true);
    });

    test('detects partial containment', () => {
      const i1 = new Interval(10, 50);
      const i2 = new Interval(30, 70);

      expect(i1.contains(i2)).toBe(false);
      expect(i2.contains(i1)).toBe(false);
    });
  });

  describe('Adjacency', () => {
    test('detects adjacent intervals', () => {
      const i1 = new Interval(10, 19);
      const i2 = new Interval(20, 30);
      
      expect(i1.isAdjacent(i2)).toBe(true);
      expect(i2.isAdjacent(i1)).toBe(true);
    });

    test('detects non-adjacent intervals', () => {
      const i1 = new Interval(10, 18);
      const i2 = new Interval(20, 30);

      expect(i1.isAdjacent(i2)).toBe(false);
    });

    test('detects overlapping intervals are not adjacent', () => {
      const i1 = new Interval(10, 20);
      const i2 = new Interval(15, 25);

      expect(i1.isAdjacent(i2)).toBe(false);
    });
  });

  describe('Merge Operations', () => {
    test('merges overlapping intervals', () => {
      const i1 = new Interval(10, 30);
      const i2 = new Interval(20, 50);
      const merged = i1.merge(i2);

      expect(merged.start).toBe(10);
      expect(merged.end).toBe(50);
    });

    test('merges adjacent intervals', () => {
      const i1 = new Interval(10, 19);
      const i2 = new Interval(20, 30);
      const merged = i1.merge(i2);

      expect(merged.start).toBe(10);
      expect(merged.end).toBe(30);
    });

    test('throws error when merging non-overlapping, non-adjacent intervals', () => {
      const i1 = new Interval(10, 18);
      const i2 = new Interval(20, 30);

      expect(() => i1.merge(i2)).toThrow('Cannot merge');
    });
  });

  describe('Subtraction Operations', () => {
    test('subtracts overlapping interval from start', () => {
      const i1 = new Interval(10, 50);
      const exclude = new Interval(5, 25);
      const result = i1.subtract(exclude);

      expect(result).toHaveLength(1);
      expect(result[0].start).toBe(26);
      expect(result[0].end).toBe(50);
    });

    test('subtracts overlapping interval from end', () => {
      const i1 = new Interval(10, 50);
      const exclude = new Interval(30, 60);
      const result = i1.subtract(exclude);

      expect(result).toHaveLength(1);
      expect(result[0].start).toBe(10);
      expect(result[0].end).toBe(29);
    });

    test('subtracts interval from middle (creates split)', () => {
      const i1 = new Interval(10, 50);
      const exclude = new Interval(20, 30);
      const result = i1.subtract(exclude);

      expect(result).toHaveLength(2);
      expect(result[0].start).toBe(10);
      expect(result[0].end).toBe(19);
      expect(result[1].start).toBe(31);
      expect(result[1].end).toBe(50);
    });

    test('returns empty array when exclude covers entire interval', () => {
      const i1 = new Interval(10, 50);
      const exclude = new Interval(5, 60);
      const result = i1.subtract(exclude);

      expect(result).toHaveLength(0);
    });

    test('returns original interval when no overlap', () => {
      const i1 = new Interval(10, 50);
      const exclude = new Interval(60, 70);
      const result = i1.subtract(exclude);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(i1);
    });
  });

  describe('Utility Methods', () => {
    test('converts to string correctly', () => {
      const interval = new Interval(10, 50);

      expect(interval.toString()).toBe('10-50');
    });

    test('converts to JSON correctly', () => {
      const interval = new Interval(10, 50);
      const json = interval.toJSON();

      expect(json).toEqual({ start: 10, end: 50 });
    });
  });

  describe('Static Methods', () => {
    test('creates from object correctly', () => {
      const interval = Interval.fromObject({ start: 10, end: 50 });
      
      expect(interval.start).toBe(10);
      expect(interval.end).toBe(50);
    });

    test('compares intervals correctly', () => {
      const i1 = new Interval(10, 50);
      const i2 = new Interval(20, 60);
      const i3 = new Interval(10, 40);
      
      expect(Interval.compare(i1, i2)).toBeLessThan(0);
      expect(Interval.compare(i2, i1)).toBeGreaterThan(0);
      expect(Interval.compare(i1, i3)).toBeGreaterThan(0);
    });
  });
});
