import { Interval } from "../core/Interval.js";
import { ERROR_MESSAGES } from "./constants.js";
import { parseIntegerSafe } from "./helpers.js";

/**
 * Parse a single interval string (e.g., "10-100").
 * @param {string} str - The interval string to parse
 * @returns {Interval} Parsed interval object
 * @throws {Error} When string format is invalid or contains invalid numbers
 */
export const parseIntervalString = (str) => {
	const trimmed = str?.trim() ?? "";

	if (!trimmed) {
		throw new Error(ERROR_MESSAGES.EMPTY_INTERVAL());
	}

	// Smart parsing for negative intervals
	// We need to find the separator dash that's not part of a negative sign	// Find the separator dash by looking for a dash that's not at the beginning
	// and not immediately following another dash
	let separatorIndex = -1;

	for (let i = 1; i < trimmed.length; i++) {
		if (trimmed[i] === "-" && trimmed[i - 1] !== "-" && /\d/.test(trimmed[i - 1])) {
			separatorIndex = i;
			break;
		}
	}

	if (separatorIndex === -1) {
		throw new Error(ERROR_MESSAGES.INVALID_INTERVAL_FORMAT(str));
	}

	const startStr = trimmed.substring(0, separatorIndex);
	const endStr = trimmed.substring(separatorIndex + 1);

	const start = parseIntegerSafe(startStr);
	const end = parseIntegerSafe(endStr);

	if (isNaN(start) || isNaN(end)) {
		throw new Error(ERROR_MESSAGES.INVALID_NUMBERS(str));
	}

	try {
		return new Interval(start, end);
	} catch (error) {
		// Re-throw with more context about the original string
		throw new Error(`${ERROR_MESSAGES.INVALID_INTERVAL_FORMAT(str)}: ${error.message}`);
	}
};

/**
 * Parse multiple intervals from various input formats.
 * @param {string|string[]} input - Comma-separated string or array of interval strings
 * @returns {Interval[]} Array of parsed interval objects
 * @throws {Error} When any interval in the input is invalid
 */
export const parseIntervals = (input) => {
	// Handle null/undefined/empty cases
	if (!input || (typeof input === "string" && !input.trim())) {
		return [];
	}

	// Convert to array of strings
	const intervalStrings = Array.isArray(input)
		? input.filter((s) => s?.trim())
		: input
				.split(",")
				.map((s) => s.trim())
				.filter(Boolean);

	// Parse each interval with error context
	return intervalStrings.map((str, index) => {
		try {
			return parseIntervalString(str);
		} catch (error) {
			throw new Error(ERROR_MESSAGES.PARSING_ERROR(index, error?.message ?? "Unknown error"));
		}
	});
};

/**
 * Create a parse result object with validation status.
 * @param {number} start - Start value
 * @param {number} end - End value
 * @param {boolean} isValid - Whether parsing was successful
 * @returns {Object} Parse result with start, end, and validation status
 */
const createParseResult = (start, end, isValid) => ({ start, end, isValid });

/**
 * Safe parse that returns validation info instead of throwing.
 * @param {string} str - The interval string to parse
 * @returns {Object} Object with start, end, and isValid properties
 */
export const safeParse = (str) => {
	try {
		const interval = parseIntervalString(str);

		return createParseResult(interval.start, interval.end, true);
	} catch {
		return createParseResult(0, 0, false);
	}
};

/**
 * Parse intervals with detailed error collection instead of throwing on first error.
 * @param {string|string[]} input - Input to parse (string or array)
 * @returns {Object} Object with intervals array and errors array
 * @returns {Interval[]} returns.intervals - Successfully parsed intervals
 * @returns {string[]} returns.errors - Array of error messages for failed parses
 */
export const parseWithErrors = (input) => {
	const errors = [];
	const intervals = [];

	const strings = Array.isArray(input) ? input : input.split(",");

	strings.forEach((str, index) => {
		try {
			const trimmed = str?.trim();

			if (trimmed) {
				intervals.push(parseIntervalString(trimmed));
			}
		} catch (error) {
			errors.push(`Interval ${index + 1}: ${error?.message ?? "Parse error"}`);
		}
	});

	return { intervals, errors };
};

/**
 * Format intervals for display as a comma-separated string.
 * @param {Interval[]} intervals - Array of intervals to format
 * @returns {string} Formatted string representation or "(none)" if empty
 */
export const formatIntervals = (intervals) => {
	if (intervals.length === 0) {
		return "(none)";
	}
	return intervals.map((i) => i.toString()).join(", ");
};

/**
 * Parse range notation and return as array of [start, end] tuples.
 * @param {string|string[]} notation - Range notation to parse
 * @returns {number[][]} Array of [start, end] number pairs
 */

export const parseRangeNotation = (notation) => {
	const intervals = parseIntervals(notation);
	return intervals.map((i) => [i.start, i.end]);
};
