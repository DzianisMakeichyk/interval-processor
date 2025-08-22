export const createValidationResult = (valid, error = null) => ({
	valid,
	...(error && { error }),
});

export const createSuccessResult = () => createValidationResult(true);

export const createErrorResult = (error) => createValidationResult(false, error);

export const isValidInteger = (num) => Number.isSafeInteger(num) && !isNaN(num);

export const parseIntegerSafe = (str) => {
	const num = parseInt(str, 10);

	return isValidInteger(num) ? num : NaN;
};
