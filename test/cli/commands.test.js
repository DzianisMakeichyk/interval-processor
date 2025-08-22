import { describe, test, expect } from "@jest/globals";
import { processFromFile, processFromArgs } from "../../src/cli/commands.js";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Get current directory for test files
const __dirname = fileURLToPath(new URL(".", import.meta.url));

// Test file paths
const TEST_FILES = {
	multipleObjects: resolve(__dirname, "test-input.json"),
	singleObject: resolve(__dirname, "test-single.json"),
	invalidJson: resolve(__dirname, "test-invalid.json"),
};

describe("CLI Commands - Integration Tests (Real Files)", () => {
	describe("Real File Processing", () => {
		test("processes real multiple objects file", async () => {
			const result = await processFromFile(TEST_FILES.multipleObjects);
			expect(result.multipleResults).toBeDefined();
			expect(result.multipleResults).toHaveLength(4);

			// Check first set matches spec example 1
			expect(result.multipleResults[0].result).toBe("10-19, 31-100");
			expect(result.multipleResults[0].index).toBe(1);

			// Check second set matches spec example 2
			expect(result.multipleResults[1].result).toBe("10-5000");
			expect(result.multipleResults[1].index).toBe(2);

			// Check third set matches spec example 3
			expect(result.multipleResults[2].result).toBe("50-94, 206-300");
			expect(result.multipleResults[2].index).toBe(3);

			// Check fourth set matches spec example 4
			expect(result.multipleResults[3].result).toBe("10-94, 206-300, 400-409, 421-500");
			expect(result.multipleResults[3].index).toBe(4);
		});

		test("processes real single object file", async () => {
			const result = await processFromFile(TEST_FILES.singleObject);
			expect(result.formatted).toBe("10-19, 31-100, 200-249, 281-300");
			expect(result.intervals).toHaveLength(4);
			expect(result.multipleResults).toBeUndefined(); // Should not have multipleResults for single object
		});

		test("throws error for real invalid JSON file", async () => {
			await expect(processFromFile(TEST_FILES.invalidJson)).rejects.toThrow("Invalid JSON format in file");
		});

		test("throws error for non-existent real file", async () => {
			await expect(processFromFile("non-existent-file.json")).rejects.toThrow("File not found");
		});
	});

	describe("Direct Arguments Processing", () => {
		test("processes direct arguments correctly", async () => {
			const result = await processFromArgs("10-100", "20-30");
			expect(result.formatted).toBe("10-19, 31-100");
			expect(result.comprehensiveStats).toBeDefined();
			expect(result.comprehensiveStats.processing.summary.executionTimeMs).toBeGreaterThanOrEqual(0);
		});

		test("handles empty excludes in direct arguments", async () => {
			const result = await processFromArgs("10-100", "");
			expect(result.formatted).toBe("10-100");
			expect(result.comprehensiveStats).toBeDefined();
		});

		test("throws error for invalid direct arguments", async () => {
			await expect(processFromArgs("invalid", "20-30")).rejects.toThrow("Processing failed");
		});
	});
});
