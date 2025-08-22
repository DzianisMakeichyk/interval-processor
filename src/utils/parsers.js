import { Interval } from "../core/Interval.js";
import { REGEX_PATTERNS, ERROR_MESSAGES } from "./constants.js";
import { parseIntegerSafe } from "./helpers.js";

// Parse a single interval string (e.g., "10-100")
export const parseIntervalString = (str) => {
	const trimmed = str?.trim() ?? "";

	if (!trimmed) {
		throw new Error(ERROR_MESSAGES.EMPTY_INTERVAL());
	}

	// Handle negative numbers by matching the pattern more carefully
	const match = trimmed.match(REGEX_PATTERNS.INTERVAL_PARSE);

	if (!match) {
		throw new Error(ERROR_MESSAGES.INVALID_INTERVAL_FORMAT(str));
	}

	const start = parseIntegerSafe(match[1]);
	const end = parseIntegerSafe(match[2]);

	if (isNaN(start) || isNaN(end)) {
		throw new Error(ERROR_MESSAGES.INVALID_NUMBERS(str));
	}

	return new Interval(start, end);
};

// Parse multiple intervals from various input formats
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

const createParseResult = (start, end, isValid) => ({ start, end, isValid });

// Safe parse that returns validation info instead of throwing
export const safeParse = (str) => {
	try {
		const interval = parseIntervalString(str);

		return createParseResult(interval.start, interval.end, true);
	} catch {
		return createParseResult(0, 0, false);
	}
};

// Parse intervals with detailed error collection
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

// Format intervals for display
export const formatIntervals = (intervals) => {
	if (intervals.length === 0) return "(none)";
	return intervals.map((i) => i.toString()).join(", ");
};

// Parse range notation (e.g., "10-100,200-300" or ["10-100", "200-300"])
export const parseRangeNotation = (notation) => {
	const intervals = parseIntervals(notation);
	return intervals.map((i) => [i.start, i.end]);
};
