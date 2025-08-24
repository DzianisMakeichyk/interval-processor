import { REGEX_PATTERNS, ERROR_MESSAGES } from "./constants.js";
import { createSuccessResult, createErrorResult, parseIntegerSafe } from "./helpers.js";

/**
 * Validate a single interval string format.
 * @param {string} str - The interval string to validate
 * @returns {Object} Validation result with valid boolean and optional error message
 */

export const validateIntervalFormat = (str) => {
	const trimmed = str?.trim() ?? "";

	if (!trimmed) {
return createSuccessResult();
} // Empty is valid (will be filtered)

	if (!REGEX_PATTERNS.INTERVAL_FORMAT.test(trimmed)) {
		return createErrorResult(ERROR_MESSAGES.INVALID_FORMAT(str));
	}

	const match = trimmed.match(REGEX_PATTERNS.INTERVAL_PARSE);

	if (!match) {
		return createErrorResult(ERROR_MESSAGES.CANNOT_PARSE(str));
	}

	const start = parseIntegerSafe(match[1]);
	const end = parseIntegerSafe(match[2]);

	if (isNaN(start) || isNaN(end)) {
		return createErrorResult(ERROR_MESSAGES.NUMBERS_TOO_LARGE(str));
	}

	if (start > end) {
		return createErrorResult(ERROR_MESSAGES.START_GREATER_THAN_END(start, end));
	}

	return createSuccessResult();
};

/**
 * Validate multiple interval strings separated by commas.
 * @param {string} input - Comma-separated interval strings
 * @returns {Object} Validation result with valid boolean and optional error message
 */
export const validateIntervalString = (input) => {
	if (!input?.trim()) {
		return createSuccessResult(); // Empty input is valid
	}

	const intervals = input
		.split(",")
		.map((s) => s.trim())
		.filter(Boolean);

	if (intervals.length === 0) {
return createSuccessResult();
}

	for (let i = 0; i < intervals.length; i++) {
		const result = validateIntervalFormat(intervals[i]);

		if (!result.valid) {
			return createErrorResult(`Interval ${i + 1}: ${result.error}`);
		}
	}

	return createSuccessResult();
};

/**
 * Validate file input structure - supports both single object and array of objects.
 * @param {any} data - The data to validate (should be object or array)
 * @returns {Object} Validation result with valid boolean and optional error message
 */

export const validateFileInput = (data) => {
	if (!data || typeof data !== "object") {
		return createErrorResult("File must contain valid JSON (object or array of objects)");
	}

	if (Array.isArray(data)) {
		if (data.length === 0) {
			return createErrorResult(ERROR_MESSAGES.EMPTY_ARRAY("Input array"));
		}

		for (let i = 0; i < data.length; i++) {
			const item = data[i];
			const result = validateSingleFileObject(item, `Array item ${i + 1}`);
			if (!result.valid) {
				return createErrorResult(ERROR_MESSAGES.INVALID_ITEM("Array", i + 1, result.error));
			}
		}

		return createSuccessResult();
	}

	return validateSingleFileObject(data, "Input object");
};

/**
 * Validate a single file object with includes/excludes structure.
 * @param {Object} fileData - The object to validate
 * @param {string} [context="Object"] - Context description for error messages
 * @returns {Object} Validation result with valid boolean and optional error message
 */

export const validateSingleFileObject = (fileData, context = "Object") => {
	if (!fileData || typeof fileData !== "object" || Array.isArray(fileData)) {
		return createErrorResult(`${context} must be an object`);
	}

	if (!("includes" in fileData)) {
		return createErrorResult(ERROR_MESSAGES.MISSING_INCLUDES(context));
	}

	const includes = fileData.includes;

	if (typeof includes !== "string" && !Array.isArray(includes)) {
		return createErrorResult(ERROR_MESSAGES.INVALID_TYPE("includes", context, "a string or array of strings"));
	}

	const excludes = fileData.excludes;

	if (excludes !== undefined && typeof excludes !== "string" && !Array.isArray(excludes)) {
		return createErrorResult(ERROR_MESSAGES.INVALID_TYPE("excludes", context, "a string or array of strings"));
	}

	const includesStr = Array.isArray(includes) ? includes.join(",") : includes;
	const includesResult = validateIntervalString(includesStr);

	if (!includesResult.valid) {
		return createErrorResult(`${context}: Invalid includes: ${includesResult.error}`);
	}

	if (excludes) {
		const excludesStr = Array.isArray(excludes) ? excludes.join(",") : excludes;
		const excludesResult = validateIntervalString(excludesStr);

		if (!excludesResult.valid) {
			return createErrorResult(`${context}: Invalid excludes: ${excludesResult.error}`);
		}
	}

	return createSuccessResult();
};

/**
 * Check if a string could be a file path by checking for .json extension.
 * @param {string} str - String to check
 * @returns {boolean} True if string appears to be a JSON file path
 */

export const isFilePath = (str) => {
	return REGEX_PATTERNS.JSON_FILE.test(str ?? "");
};

/**
 * Validate command line arguments for includes, excludes, and file parameters.
 * @param {string} includes - Include intervals string
 * @param {string} excludes - Exclude intervals string
 * @param {string} file - File path
 * @returns {Object} Validation result with valid boolean and optional error message
 */

export const validateCliArgs = (includes, excludes, file) => {
	if (file) {
		if (!isFilePath(file)) {
			return createErrorResult(ERROR_MESSAGES.INVALID_FILE_EXTENSION(file));
		}
		return createSuccessResult(); // File content will be validated after reading
	}

	if (includes === undefined || includes === null) {
		return createErrorResult("Must provide includes parameter or file");
	}

	const includesResult = validateIntervalString(includes);
	if (!includesResult.valid) {
		return createErrorResult(`Invalid includes: ${includesResult.error}`);
	}

	if (excludes) {
		const excludesResult = validateIntervalString(excludes);
		if (!excludesResult.valid) {
			return createErrorResult(`Invalid excludes: ${excludesResult.error}`);
		}
	}

	return createSuccessResult();
};
