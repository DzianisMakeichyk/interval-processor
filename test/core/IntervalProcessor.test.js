import { describe, test, expect } from "@jest/globals";
import { IntervalProcessor } from "../../src/core/IntervalProcessor.js";
import { Interval } from "../../src/core/Interval.js";

describe("IntervalProcessor", () => {
	describe("Specification Examples", () => {
		test("Example 1: Basic exclusion", () => {
			const result = IntervalProcessor.process("10-100", "20-30");

			expect(result.formatted).toBe("10-19, 31-100");
		});

		test("Example 2: Merge overlapping includes", () => {
			const result = IntervalProcessor.process("50-5000, 10-100", "");

			expect(result.formatted).toBe("10-5000");
		});

		test("Example 3: Multiple intervals with exclusion", () => {
			const result = IntervalProcessor.process("200-300, 50-150", "95-205");

			expect(result.formatted).toBe("50-94, 206-300");
		});

		test("Example 4: Complex case", () => {
			const result = IntervalProcessor.process("200-300, 10-100, 400-500", "410-420, 95-205, 100-150");

			expect(result.formatted).toBe("10-94, 206-300, 400-409, 421-500");
		});
	});

	describe("Process Method", () => {
		test("handles object input", () => {
			const result = IntervalProcessor.process({
				includes: "10-100",
				excludes: "20-30",
			});

			expect(result.formatted).toBe("10-19, 31-100");
		});

		test("handles array input", () => {
			const result = IntervalProcessor.process({
				includes: ["10-100", "200-300"],
				excludes: ["50-60"],
			});

			expect(result.formatted).toBe("10-49, 61-100, 200-300");
		});

		test("handles empty includes", () => {
			const result = IntervalProcessor.process("", "20-30");

			expect(result.formatted).toBe("(none)");
			expect(result.intervals).toHaveLength(0);
		});

		test("handles empty excludes", () => {
			const result = IntervalProcessor.process("10-100", "");

			expect(result.formatted).toBe("10-100");
		});

		test("handles no input", () => {
			const result = IntervalProcessor.process("", "");

			expect(result.formatted).toBe("(none)");
		});
	});

	describe("Merge Intervals", () => {
		test("merges overlapping intervals", () => {
			const intervals = [new Interval(10, 30), new Interval(20, 50), new Interval(60, 80)];
			const merged = IntervalProcessor.mergeIntervals(intervals);

			expect(merged).toHaveLength(2);
			expect(merged[0].start).toBe(10);
			expect(merged[0].end).toBe(50);
			expect(merged[1].start).toBe(60);
			expect(merged[1].end).toBe(80);
		});

		test("merges adjacent intervals", () => {
			const intervals = [new Interval(10, 19), new Interval(20, 30), new Interval(31, 40)];
			const merged = IntervalProcessor.mergeIntervals(intervals);

			expect(merged).toHaveLength(1);
			expect(merged[0].start).toBe(10);
			expect(merged[0].end).toBe(40);
		});

		test("handles empty array", () => {
			const merged = IntervalProcessor.mergeIntervals([]);

			expect(merged).toHaveLength(0);
		});

		test("handles single interval", () => {
			const intervals = [new Interval(10, 50)];
			const merged = IntervalProcessor.mergeIntervals(intervals);

			expect(merged).toHaveLength(1);
			expect(merged[0]).toEqual(intervals[0]);
		});
	});

	describe("Subtract Intervals", () => {
		test("subtracts multiple excludes", () => {
			const includes = [new Interval(10, 100)];
			const excludes = [new Interval(20, 30), new Interval(50, 60)];
			const result = IntervalProcessor.subtractIntervals(includes, excludes);

			expect(result).toHaveLength(3);
			expect(result[0].toString()).toBe("10-19");
			expect(result[1].toString()).toBe("31-49");
			expect(result[2].toString()).toBe("61-100");
		});

		test("handles overlapping excludes", () => {
			const includes = [new Interval(10, 100)];
			const excludes = [new Interval(20, 50), new Interval(40, 70)];
			const result = IntervalProcessor.subtractIntervals(includes, excludes);

			expect(result).toHaveLength(2);
			expect(result[0].toString()).toBe("10-19");
			expect(result[1].toString()).toBe("71-100");
		});

		test("handles complete exclusion", () => {
			const includes = [new Interval(10, 50)];
			const excludes = [new Interval(5, 60)];
			const result = IntervalProcessor.subtractIntervals(includes, excludes);

			expect(result).toHaveLength(0);
		});

		test("handles no excludes", () => {
			const includes = [new Interval(10, 50)];
			const result = IntervalProcessor.subtractIntervals(includes, []);

			expect(result).toEqual(includes);
		});
	});

	describe("Validation", () => {
		test("validates valid input", () => {
			expect(IntervalProcessor.validate("10-100", "20-30")).toBe(true);
		});

		test("validates empty excludes", () => {
			expect(IntervalProcessor.validate("10-100")).toBe(true);
		});

		test("validates array input", () => {
			expect(IntervalProcessor.validate(["10-100", "200-300"])).toBe(true);
		});

		test("rejects invalid intervals", () => {
			expect(IntervalProcessor.validate("invalid")).toBe(false);
		});
	});

	describe("Edge Cases", () => {
		test("handles negative numbers", () => {
			const result = IntervalProcessor.process("-100--10", "-50--30");

			expect(result.formatted).toBe("-100--51, -29--10");
		});

		test("handles single point intervals", () => {
			const result = IntervalProcessor.process("50-50", "");

			expect(result.formatted).toBe("50-50");
		});

		test("handles large numbers", () => {
			const result = IntervalProcessor.process("1000000-2000000", "1500000-1600000");

			expect(result.formatted).toBe("1000000-1499999, 1600001-2000000");
		});

		test("handles multiple complex exclusions", () => {
			const result = IntervalProcessor.process("1-1000", "100-200, 300-400, 500-600, 700-800");
			expect(result.formatted).toBe("1-99, 201-299, 401-499, 601-699, 801-1000");
		});
	});

	describe("Performance", () => {
		test("handles large number of intervals efficiently", () => {
			const includes = Array.from({ length: 1000 }, (_, i) => `${i * 100}-${i * 100 + 50}`).join(",");
			const excludes = Array.from({ length: 500 }, (_, i) => `${i * 200 + 25}-${i * 200 + 35}`).join(",");
			const start = Date.now();
			const result = IntervalProcessor.process(includes, excludes);
			const duration = Date.now() - start;

			expect(duration).toBeLessThan(1000); // Should complete within 1 second
			expect(result.intervals.length).toBeGreaterThan(0);
		});
	});
});
