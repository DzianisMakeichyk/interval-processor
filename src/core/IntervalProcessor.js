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
		try {
			const processInput = typeof input === "string" ? { includes: input, excludes: excludes ?? "" } : input;

			const includeIntervals = parseIntervals(processInput.includes ?? "");
			const excludeIntervals = parseIntervals(processInput.excludes ?? "");

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
		} catch (error) {
			return {
				intervals: [],
				formatted: `(error: ${error.message})`,
				error: error.message,
			};
		}
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
				try {
					current = current.merge(next);
				} catch (error) {
					merged.push(current);
					current = next;
				}
			} else {
				merged.push(current);
				current = next;
			}
		}

		merged.push(current);

		return merged;
	};

	/**
	 * Subtract exclude intervals from include intervals using optimized algorithm.
	 * @param {Interval[]} includes - Array of include intervals (assumed sorted)
	 * @param {Interval[]} excludes - Array of exclude intervals
	 * @returns {Interval[]} Array of remaining intervals after subtraction
	 */
	static subtractIntervals = (includes, excludes) => {
		if (excludes.length === 0) return includes;

		const sortedExcludes = [...excludes].sort(Interval.compare);
		const result = [];

		for (const include of includes) {
			let current = [include];

			for (const exclude of sortedExcludes) {
				// Early exit: exclude is beyond current include
				if (exclude.start > include.end) break;
				
				// Skip: exclude is before current include
				if (exclude.end < include.start) continue;

				// Apply exclude to all current intervals
				current = current.flatMap(interval => 
					interval.overlaps(exclude) ? interval.subtract(exclude) : [interval]
				);
			}

			result.push(...current);
		}

		return result;
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
