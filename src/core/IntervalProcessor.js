import { Interval } from "./Interval.js";
import { parseIntervals } from "../utils/parsers.js";
import { validateIntervalString } from "../utils/validators.js";

export class IntervalProcessor {
	/**
	 * Main processing method using sweep line algorithm.
	 * @param {string|Object} input - Either interval string or object with includes/excludes.
	 * @param {string} [excludes] - Exclude intervals string.
	 * @returns {Object} Object with processed intervals and formatted string.
	 * @returns {Object[]} returns.intervals - Array of interval objects {start, end}
	 * @returns {string} returns.formatted - Formatted string representation
	 */
	static process = (input, excludes) => {
		const processInput = typeof input === "string" ? { includes: input, excludes: excludes ?? "" } : input;

		const includeIntervals = parseIntervals(processInput.includes ?? "");
		const excludeIntervals = parseIntervals(processInput.excludes ?? "");

		// Edge case: no includes
		if (includeIntervals.length === 0) {
			return {
				intervals: [],
				formatted: "(none)",
			};
		}

		// Step 1: Merge overlapping includes
		const merged = this.mergeIntervals(includeIntervals);
		// Step 2: Subtract excludes
		const result = this.subtractIntervals(merged, excludeIntervals);
		// Step 3: Format output
		const formatted = result.length > 0 ? result.map((i) => i.toString()).join(", ") : "(none)";

		return {
			intervals: result.map((i) => i.toJSON()),
			formatted,
		};
	};

	/**
	 * Merge overlapping and adjacent intervals using sweep line algorithm.
	 * @param {Interval[]} intervals - Array of intervals to merge
	 * @returns {Interval[]} Array of merged intervals, sorted by start point
	 */
	static mergeIntervals = (intervals) => {
		if (intervals.length <= 1) {
return intervals;
}

		// Sort by start point (sweep line)
		const sorted = [...intervals].sort(Interval.compare);
		const merged = [];
		let current = sorted[0];

		if (!current) {
return [];
}

		for (let i = 1; i < sorted.length; i++) {
			const next = sorted[i];

			if (!next) {
continue;
}
			if (current.overlaps(next) || current.isAdjacent(next)) {
				current = current.merge(next);
			} else {
				// No overlap - add current to result
				merged.push(current);
				current = next;
			}
		}

		merged.push(current);

		return merged;
	};

	/**
	 * Subtract exclude intervals from include intervals.
	 * @param {Interval[]} includes - Array of include intervals
	 * @param {Interval[]} excludes - Array of exclude intervals
	 * @returns {Interval[]} Array of remaining intervals after subtraction
	 */
	static subtractIntervals = (includes, excludes) => {
		if (excludes.length === 0) {
return includes;
}

		let result = [...includes];

		// Process each exclude interval
		// O(nm) or O(n2)
		for (const exclude of excludes) {
			const newResult = [];

			// Subtract exclude from each interval
			for (const interval of result) {
				const remaining = interval.subtract(exclude);
				newResult.push(...remaining);
			}

			result = newResult;
		}

		// Sort final result by start point
		// O(n log(n))
		return result.sort(Interval.compare);
	};

	/**
	 * Validate input intervals before processing.
	 * @param {string|string[]} includes - Include intervals string or array
	 * @param {string|string[]} [excludes] - Exclude intervals string or array
	 * @returns {boolean} True if both includes and excludes are valid
	 */
	static validate = (includes, excludes) => {
		const includeStr = Array.isArray(includes) ? includes.join(",") : includes;
		const excludeStr = Array.isArray(excludes) ? excludes?.join(",") : excludes;

		const includeValid = validateIntervalString(includeStr);
		const excludeValid = !excludeStr || validateIntervalString(excludeStr);

		return includeValid.valid && (typeof excludeValid === "boolean" ? excludeValid : excludeValid.valid);
	};
}
