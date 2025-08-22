import { describe, test, expect } from "@jest/globals";
import { createValidationResult, createSuccessResult, createErrorResult, isValidInteger, parseIntegerSafe } from "../../src/utils/helpers.js";

describe("Helper Utilities", () => {
	describe("createValidationResult", () => {
		test("creates valid result without error", () => {
			const result = createValidationResult(true);

			expect(result.valid).toBe(true);
			expect(result.error).toBeUndefined();
		});

		test("creates valid result with null error", () => {
			const result = createValidationResult(true, null);

			expect(result.valid).toBe(true);
			expect(result.error).toBeUndefined();
		});

		test("creates invalid result with error", () => {
			const result = createValidationResult(false, "Test error");

			expect(result.valid).toBe(false);
			expect(result.error).toBe("Test error");
		});

		test("creates invalid result without error", () => {
			const result = createValidationResult(false);

			expect(result.valid).toBe(false);
			expect(result.error).toBeUndefined();
		});
	});

	describe("createErrorResult", () => {
		test("creates error result with message", () => {
			const result = createErrorResult("Test error message");

			expect(result.valid).toBe(false);
			expect(result.error).toBe("Test error message");
		});

		test("creates error result with complex message", () => {
			const result = createErrorResult("Complex error: invalid format");

			expect(result.valid).toBe(false);
			expect(result.error).toBe("Complex error: invalid format");
		});
	});

	describe("isValidInteger", () => {
		test("validates safe integers", () => {
			expect(isValidInteger(0)).toBe(true);
			expect(isValidInteger(42)).toBe(true);
			expect(isValidInteger(-42)).toBe(true);
			expect(isValidInteger(Number.MAX_SAFE_INTEGER)).toBe(true);
			expect(isValidInteger(Number.MIN_SAFE_INTEGER)).toBe(true);
		});

		test("rejects unsafe integers", () => {
			expect(isValidInteger(Number.MAX_SAFE_INTEGER + 1)).toBe(false);
			expect(isValidInteger(Number.MIN_SAFE_INTEGER - 1)).toBe(false);
		});

		test("rejects non-integers", () => {
			expect(isValidInteger(3.14)).toBe(false);
			expect(isValidInteger(0.1)).toBe(false);
			expect(isValidInteger(-2.5)).toBe(false);
		});

		test("rejects NaN and infinite values", () => {
			expect(isValidInteger(NaN)).toBe(false);
			expect(isValidInteger(Infinity)).toBe(false);
			expect(isValidInteger(-Infinity)).toBe(false);
		});

		test("rejects non-numbers", () => {
			expect(isValidInteger("42")).toBe(false);
			expect(isValidInteger(null)).toBe(false);
			expect(isValidInteger(undefined)).toBe(false);
			expect(isValidInteger({})).toBe(false);
			expect(isValidInteger([])).toBe(false);
		});
	});

	describe("parseIntegerSafe", () => {
		test("parses valid integer strings", () => {
			expect(parseIntegerSafe("0")).toBe(0);
			expect(parseIntegerSafe("42")).toBe(42);
			expect(parseIntegerSafe("-42")).toBe(-42);
			expect(parseIntegerSafe("123456")).toBe(123456);
		});

		test("parses strings with leading/trailing whitespace", () => {
			expect(parseIntegerSafe(" 42 ")).toBe(42);
			expect(parseIntegerSafe("\t123\n")).toBe(123);
		});

		test("handles decimal strings by truncating", () => {
			expect(parseIntegerSafe("42.7")).toBe(42);
			expect(parseIntegerSafe("-3.9")).toBe(-3);
		});

		test("returns NaN for unsafe integers", () => {
			const unsafeNumber = (Number.MAX_SAFE_INTEGER + 1).toString();

			expect(parseIntegerSafe(unsafeNumber)).toBeNaN();
		});

		test("returns NaN for invalid strings", () => {
			expect(parseIntegerSafe("abc")).toBeNaN();
			expect(parseIntegerSafe("")).toBeNaN();
			expect(parseIntegerSafe("  ")).toBeNaN();
		});

		test("parses partial numbers (parseInt behavior)", () => {
			// parseInt will parse numbers even with trailing non-digits
			expect(parseIntegerSafe("12abc")).toBe(12);
			expect(parseIntegerSafe("42.5extra")).toBe(42);
		});

		test("returns NaN for non-string input", () => {
			expect(parseIntegerSafe(null)).toBeNaN();
			expect(parseIntegerSafe(undefined)).toBeNaN();
			expect(parseIntegerSafe({})).toBeNaN();
		});

		test("handles number input correctly", () => {
			// Numbers are converted to string then parsed
			expect(parseIntegerSafe(42)).toBe(42);
			expect(parseIntegerSafe(-25)).toBe(-25);
		});

		test("handles edge cases", () => {
			expect(parseIntegerSafe("0")).toBe(0);
			expect(parseIntegerSafe("-0")).toBe(-0);
			expect(parseIntegerSafe("+42")).toBe(42);
		});
	});

	describe("Integration scenarios", () => {
		test("validation result creation with number parsing", () => {
			const num = parseIntegerSafe("42");
			const result = isValidInteger(num) ? createSuccessResult() : createErrorResult("Invalid number");

			expect(result.valid).toBe(true);
			expect(result.error).toBeUndefined();
		});

		test("validation result creation with invalid number", () => {
			const num = parseIntegerSafe("abc");
			const result = isValidInteger(num) ? createSuccessResult() : createErrorResult("Invalid number");

			expect(result.valid).toBe(false);
			expect(result.error).toBe("Invalid number");
		});
	});
});
