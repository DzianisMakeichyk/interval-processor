/**
 * Create a validation result object with optional error message.
 * @param {boolean} valid - Whether validation passed
 * @param {string|null} [error=null] - Error message if validation failed
 * @returns {Object} Validation result object with valid flag and optional error
 */
export const createValidationResult = (valid, error = null) => ({
	valid,
	...(error && { error }),
});

/**
 * Create a successful validation result.
 * @returns {Object} Validation result with valid: true
 */
export const createSuccessResult = () => createValidationResult(true);

/**
 * Create a failed validation result with error message.
 * @param {string} error - Error message describing the validation failure
 * @returns {Object} Validation result with valid: false and error message
 */
export const createErrorResult = (error) => createValidationResult(false, error);

/**
 * Check if a number is a valid safe integer.
 * @param {number} num - Number to validate
 * @returns {boolean} True if number is a safe integer and not NaN
 */
export const isValidInteger = (num) => Number.isSafeInteger(num) && !isNaN(num);

/**
 * Safely parse a string to integer with overflow protection.
 * @param {string} str - String to parse
 * @returns {number} Parsed integer or NaN if invalid/overflow
 */
export const parseIntegerSafe = (str) => {
	const num = parseInt(str, 10);

	return isValidInteger(num) ? num : NaN;
};
