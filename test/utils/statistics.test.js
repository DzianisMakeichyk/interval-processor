import { describe, test, expect } from "@jest/globals";
import { getBasicStatistics, getIntervalSize, getMemoryUsage, measureMemoryUsage } from "../../src/utils/statistics.js";
import { Interval } from "../../src/core/Interval.js";

describe("Statistics Utilities", () => {
	describe("getIntervalSize", () => {
		test("calculates size correctly for positive intervals", () => {
			const interval = new Interval(10, 20);
			expect(getIntervalSize(interval)).toBe(11); // Inclusive range
		});

		test("calculates size correctly for single point intervals", () => {
			const interval = new Interval(5, 5);
			expect(getIntervalSize(interval)).toBe(1);
		});

		test("calculates size correctly for negative intervals", () => {
			const interval = new Interval(-10, -5);
			expect(getIntervalSize(interval)).toBe(6);
		});

		test("calculates size correctly for intervals crossing zero", () => {
			const interval = new Interval(-5, 5);
			expect(getIntervalSize(interval)).toBe(11);
		});
	});

	describe("getBasicStatistics", () => {
		test("calculates basic statistics for multiple intervals", () => {
			const intervals = [new Interval(10, 20), new Interval(30, 50)];
			const stats = getBasicStatistics(intervals);

			expect(stats.count).toBe(2);
			expect(stats.totalCoverage).toBe(32); // 11 + 21
			expect(stats.minStart).toBe(10);
			expect(stats.maxEnd).toBe(50);
		});

		test("handles empty array", () => {
			const stats = getBasicStatistics([]);

			expect(stats.count).toBe(0);
			expect(stats.totalCoverage).toBe(0);
			expect(stats.minStart).toBe(0);
			expect(stats.maxEnd).toBe(0);
		});

		test("handles null input", () => {
			const stats = getBasicStatistics(null);

			expect(stats.count).toBe(0);
			expect(stats.totalCoverage).toBe(0);
			expect(stats.minStart).toBe(0);
			expect(stats.maxEnd).toBe(0);
		});

		test("handles single interval", () => {
			const intervals = [new Interval(5, 15)];
			const stats = getBasicStatistics(intervals);

			expect(stats.count).toBe(1);
			expect(stats.totalCoverage).toBe(11);
			expect(stats.minStart).toBe(5);
			expect(stats.maxEnd).toBe(15);
		});

		test("handles negative intervals", () => {
			const intervals = [new Interval(-50, -30), new Interval(-10, 10)];
			const stats = getBasicStatistics(intervals);

			expect(stats.count).toBe(2);
			expect(stats.totalCoverage).toBe(42); // 21 + 21
			expect(stats.minStart).toBe(-50);
			expect(stats.maxEnd).toBe(10);
		});
	});

	describe("getMemoryUsage", () => {
		test("returns memory usage object with required properties", () => {
			const memory = getMemoryUsage();

			expect(memory).toHaveProperty("rss");
			expect(memory).toHaveProperty("heapTotal");
			expect(memory).toHaveProperty("heapUsed");
			expect(memory).toHaveProperty("external");
			expect(memory).toHaveProperty("arrayBuffers");

			// Check that each property has bytes and mb
			expect(memory.rss).toHaveProperty("bytes");
			expect(memory.rss).toHaveProperty("mb");
			expect(typeof memory.rss.bytes).toBe("number");
			expect(typeof memory.rss.mb).toBe("number");

			expect(memory.heapTotal).toHaveProperty("bytes");
			expect(memory.heapTotal).toHaveProperty("mb");
			expect(memory.heapUsed).toHaveProperty("bytes");
			expect(memory.heapUsed).toHaveProperty("mb");
		});

		test("returns positive values for memory usage", () => {
			const memory = getMemoryUsage();

			expect(memory.rss.bytes).toBeGreaterThan(0);
			expect(memory.rss.mb).toBeGreaterThan(0);
			expect(memory.heapTotal.bytes).toBeGreaterThan(0);
			expect(memory.heapTotal.mb).toBeGreaterThan(0);
			expect(memory.heapUsed.bytes).toBeGreaterThan(0);
			expect(memory.heapUsed.mb).toBeGreaterThan(0);
		});
	});

	describe("measureMemoryUsage", () => {
		test("measures memory usage for synchronous function", async () => {
			const testFunction = () => {
				const arr = new Array(1000).fill(42);
				return arr.length;
			};

			const result = await measureMemoryUsage(testFunction);

			expect(result).toHaveProperty("result");
			expect(result).toHaveProperty("startMemory");
			expect(result).toHaveProperty("endMemory");
			expect(result).toHaveProperty("memoryDiff");
			expect(result).toHaveProperty("executionTime");
			expect(result).toHaveProperty("summary");
			expect(result.result).toBe(1000);
			expect(typeof result.executionTime.nanoseconds).toBe("number");
			expect(typeof result.executionTime.milliseconds).toBe("number");
		});

		test("measures memory usage for asynchronous function", async () => {
			const testFunction = async () => {
				await new Promise((resolve) => setTimeout(resolve, 10));
				return "async result";
			};

			const result = await measureMemoryUsage(testFunction);

			expect(result.result).toBe("async result");
			// Allow for timing variations in different environments (CI vs local)
			expect(result.executionTime.milliseconds).toBeGreaterThanOrEqual(5);
		});

		test("handles function that throws error", async () => {
			const testFunction = () => {
				throw new Error("Test error");
			};

			const result = await measureMemoryUsage(testFunction);
			expect(result.error).toBeInstanceOf(Error);
			expect(result.error.message).toBe("Test error");
			expect(result.result).toBeUndefined();
		});

		test("includes performance summary", async () => {
			const testFunction = () => "test";
			const result = await measureMemoryUsage(testFunction);

			expect(result.summary).toHaveProperty("peakHeapUsed");
			expect(result.summary).toHaveProperty("memoryGrowth");
			expect(result.summary).toHaveProperty("executionTimeMs");
		});
	});
});
