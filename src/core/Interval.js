export class Interval {
	/**
	 * Creates a new interval instance.
	 * @param {number} start - Start of the interval
	 * @param {number} end - End of the interval
	 * @throws {Error} When start is greater than end
	 */
	constructor(start, end) {
		if (start > end) {
			throw new Error(`Invalid interval: start (${start}) cannot be greater than end (${end})`);
		}

		this.start = start;
		this.end = end;
	}

	/**
	 * Check if this interval overlaps with another interval.
	 * @param {Interval} other - The interval to check overlap with
	 * @returns {boolean} True if intervals overlap, false otherwise
	 */
	overlaps = (other) => this.start <= other.end && other.start <= this.end;

	/**
	 * Check if this interval completely contains another interval.
	 * @param {Interval} other - The interval to check containment for
	 * @returns {boolean} True if this interval contains the other, false otherwise
	 */
	contains = (other) => this.start <= other.start && this.end >= other.end;

	/**
	 * Check if this interval is adjacent to another.
	 * @param {Interval} other - The interval to check adjacency with
	 * @returns {boolean} True if intervals are adjacent, false otherwise
	 */
	isAdjacent = (other) => this.end + 1 === other.start || other.end + 1 === this.start;

	/**
	 * Merge this interval with another overlapping or adjacent interval.
	 * @param {Interval} other - The interval to merge with
	 * @returns {Interval} A new merged interval
	 * @throws {Error} When intervals cannot be merged (not overlapping or adjacent)
	 */
	merge = (other) => {
		if (!this.overlaps(other) && !this.isAdjacent(other)) {
			throw new Error("Cannot merge non-overlapping/non-adjacent intervals");
		}

		try {
			return new Interval(Math.min(this.start, other.start), Math.max(this.end, other.end));
		} catch (error) {
			throw new Error(`Merge failed: ${error.message}`);
		}
	};

	/**
	 * Subtract an interval from this interval, returning remaining parts.
	 * @param {Interval} exclude - The interval to subtract
	 * @returns {Interval[]} Array of remaining intervals after subtraction
	 */
	subtract = (exclude) => {
		if (!this.overlaps(exclude)) {
			return [this];
		}
		if (exclude.contains(this)) {
			return [];
		}

		const result = [];

		if (exclude.start > this.start && exclude.end < this.end) {
			try {
				result.push(new Interval(this.start, exclude.start - 1));
				result.push(new Interval(exclude.end + 1, this.end));
			} catch (error) {
				return [this];
			}
			return result;
		}

		if (exclude.start <= this.start && exclude.end < this.end) {
			try {
				result.push(new Interval(exclude.end + 1, this.end));
			} catch (error) {
				return [];
			}
			return result;
		}

		if (exclude.start > this.start && exclude.end >= this.end) {
			try {
				result.push(new Interval(this.start, exclude.start - 1));
			} catch (error) {
				return [];
			}
			return result;
		}

		return result;
	};

	/**
	 * String representation of the interval.
	 * @returns {string} Interval in "start-end" format
	 */
	toString = () => `${this.start}-${this.end}`;

	/**
	 * JSON representation of the interval.
	 * @returns {Object} Object with start and end properties
	 */
	toJSON = () => ({
		start: this.start,
		end: this.end,
	});

	/**
	 * Static factory method to create interval from object.
	 * @param {Object} data - Object with start and end properties
	 * @param {number} data.start - Start value
	 * @param {number} data.end - End value
	 * @returns {Interval} New interval instance
	 * @throws {Error} When data is invalid or interval cannot be created
	 */
	static fromObject = (data) => {
		if (!data || typeof data !== "object") {
			throw new Error("Invalid data: must be an object with start and end properties");
		}
		if (typeof data.start !== "number" || typeof data.end !== "number") {
			throw new Error("Invalid data: start and end must be numbers");
		}
		return new Interval(data.start, data.end);
	};

	/**
	 * Compare intervals for sorting (by start, then by end).
	 * @param {Interval} a - First interval to compare
	 * @param {Interval} b - Second interval to compare
	 * @returns {number} Negative if a < b, positive if a > b, zero if equal
	 */
	static compare = (a, b) => (a.start !== b.start ? a.start - b.start : a.end - b.end);
}
