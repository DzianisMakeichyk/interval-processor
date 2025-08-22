export class Interval {
  /**
   * @param {number} start - Start of the interval
   * @param {number} end - End of the interval
   */

  constructor(start, end) {
    if (start > end) {
      throw new Error(`Invalid interval: start (${start}) cannot be greater than end (${end})`);
    };

    this.start = start;
    this.end = end;
  };

  // Check if this interval overlaps with another
  overlaps = (other) => this.start <= other.end && other.start <= this.end;

  // Check if this interval completely contains another
  contains = (other) => this.start <= other.start && this.end >= other.end;

  // Check if this interval is adjacent to another (touching but not overlapping)
  isAdjacent = (other) => this.end + 1 === other.start || other.end + 1 === this.start;

  // Merge this interval with another overlapping or adjacent interval
  merge = (other) => {
    if (!this.overlaps(other) && !this.isAdjacent(other)) {
      throw new Error('Cannot merge non-overlapping/non-adjacent intervals');
    };

    return new Interval(
      Math.min(this.start, other.start),
      Math.max(this.end, other.end)
    );
  };

  // Subtract an interval from this interval
  subtract = (exclude) => {
    // No overlap - return original
    if (!this.overlaps(exclude)) return [this];

    // Complete overlap - exclude covers entire interval
    if (exclude.contains(this)) return [];

    const result = [];

    // Exclude cuts the middle - split into two
    if (exclude.start > this.start && exclude.end < this.end) {
      result.push(new Interval(this.start, exclude.start - 1));
      result.push(new Interval(exclude.end + 1, this.end));

      return result;
    };

    // Exclude overlaps from start
    if (exclude.start <= this.start && exclude.end < this.end) {
      result.push(new Interval(exclude.end + 1, this.end));

      return result;
    };

    // Exclude overlaps from end
    if (exclude.start > this.start && exclude.end >= this.end) {
      result.push(new Interval(this.start, exclude.start - 1));

      return result;
    };

    return result;
  };

  // String representation of the interval
  toString = () => `${this.start}-${this.end}`;

  toJSON = () => ({
    start: this.start,
    end: this.end
  });

  // Static factory method to create from object
  static fromObject = (data) =>
    new Interval(data.start, data.end);

  // Compare intervals for sorting (by start, then by end)
  static compare = (a, b) =>
    a.start !== b.start ? a.start - b.start : a.end - b.end;
}
