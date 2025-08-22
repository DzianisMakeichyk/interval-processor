import { REGEX_PATTERNS, ERROR_MESSAGES } from "./constants.js";
import { createSuccessResult, createErrorResult, parseIntegerSafe } from "./helpers.js";

// Validate a single interval string format
export const validateIntervalFormat = (str) => {
	const trimmed = str?.trim() ?? "";

	if (!trimmed) return createSuccessResult(); // Empty is valid (will be filtered)

	// Check basic format
	if (!REGEX_PATTERNS.INTERVAL_FORMAT.test(trimmed)) {
		return createErrorResult(ERROR_MESSAGES.INVALID_FORMAT(str));
	}

	// Parse and validate numbers
	const match = trimmed.match(REGEX_PATTERNS.INTERVAL_PARSE);

	if (!match) {
		return createErrorResult(ERROR_MESSAGES.CANNOT_PARSE(str));
	}

	const start = parseIntegerSafe(match[1]);
	const end = parseIntegerSafe(match[2]);

	// Check for integer overflow
	if (isNaN(start) || isNaN(end)) {
		return createErrorResult(ERROR_MESSAGES.NUMBERS_TOO_LARGE(str));
	}

	// Check start <= end
	if (start > end) {
		return createErrorResult(ERROR_MESSAGES.START_GREATER_THAN_END(start, end));
	}

	return createSuccessResult();
};

// Validate multiple interval strings
export const validateIntervalString = (input) => {
	if (!input?.trim()) {
		return createSuccessResult(); // Empty input is valid
	}

	const intervals = input
		.split(",")
		.map((s) => s.trim())
		.filter(Boolean);

	if (intervals.length === 0) return createSuccessResult();

	// Check each interval
	for (let i = 0; i < intervals.length; i++) {
		const result = validateIntervalFormat(intervals[i]);

		if (!result.valid) {
			return createErrorResult(`Interval ${i + 1}: ${result.error}`);
		}
	}

	return createSuccessResult();
};

// Validate file input structure - supports both single object and array of objects
export const validateFileInput = (data) => {
	// Check if data exists and is valid JSON
	if (!data || typeof data !== "object") {
		return createErrorResult("File must contain valid JSON (object or array of objects)");
	}

	// Handle array of objects format
	if (Array.isArray(data)) {
		if (data.length === 0) {
			return createErrorResult(ERROR_MESSAGES.EMPTY_ARRAY("Input array"));
		}

		// Validate each object in the array
		for (let i = 0; i < data.length; i++) {
			const item = data[i];
			const result = validateSingleFileObject(item, `Array item ${i + 1}`);
			if (!result.valid) {
				return createErrorResult(ERROR_MESSAGES.INVALID_ITEM("Array", i + 1, result.error));
			}
		}

		return createSuccessResult();
	}

	// Handle single object format
	return validateSingleFileObject(data, "Input object");
};

// Validate a single file object
export const validateSingleFileObject = (fileData, context = "Object") => {
	// Check if data is an object
	if (!fileData || typeof fileData !== "object" || Array.isArray(fileData)) {
		return createErrorResult(`${context} must be an object`);
	}

	// Check for required fields
	if (!("includes" in fileData)) {
		return createErrorResult(ERROR_MESSAGES.MISSING_INCLUDES(context));
	}

	// Validate includes field
	const includes = fileData.includes;

	if (typeof includes !== "string" && !Array.isArray(includes)) {
		return createErrorResult(ERROR_MESSAGES.INVALID_TYPE("includes", context, "a string or array of strings"));
	}

	// Validate excludes field if present
	const excludes = fileData.excludes;

	if (excludes !== undefined && typeof excludes !== "string" && !Array.isArray(excludes)) {
		return createErrorResult(ERROR_MESSAGES.INVALID_TYPE("excludes", context, "a string or array of strings"));
	}

	// Validate interval formats
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

// Check if a string could be a file path
export const isFilePath = (str) => {
	return REGEX_PATTERNS.JSON_FILE.test(str ?? "");
};

// Validate command line arguments
export const validateCliArgs = (includes, excludes, file) => {
	// File mode validation
	if (file) {
		if (!isFilePath(file)) {
			return createErrorResult(ERROR_MESSAGES.INVALID_FILE_EXTENSION(file));
		}
		return createSuccessResult(); // File content will be validated after reading
	}

	// Direct input mode validation
	if (!includes) {
		return createErrorResult("Must provide includes parameter or file");
	}

	// Validate includes format
	const includesResult = validateIntervalString(includes);
	if (!includesResult.valid) {
		return createErrorResult(`Invalid includes: ${includesResult.error}`);
	}

	// Validate excludes format if provided
	if (excludes) {
		const excludesResult = validateIntervalString(excludes);
		if (!excludesResult.valid) {
			return createErrorResult(`Invalid excludes: ${excludesResult.error}`);
		}
	}

	return createSuccessResult();
};
