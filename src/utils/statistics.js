/**
 * Calculate the size (number of integers) in an interval.
 * @param {Object} interval - Interval object with start and end properties
 * @param {number} interval.start - Start of the interval
 * @param {number} interval.end - End of the interval
 * @returns {number} Number of integers in the interval (inclusive)
 */
export const getIntervalSize = (interval) => interval.end - interval.start + 1;

/**
 * Calculate basic statistics for an array of intervals.
 * @param {Object[]} intervals - Array of interval objects
 * @returns {Object} Statistics object with count, coverage, and range information
 * @returns {number} returns.count - Number of intervals
 * @returns {number} returns.totalCoverage - Total number of integers covered
 * @returns {number} returns.minStart - Minimum start value across all intervals
 * @returns {number} returns.maxEnd - Maximum end value across all intervals
 */
export const getBasicStatistics = (intervals) => {
	if (!intervals || intervals.length === 0) {
		return { count: 0, totalCoverage: 0, minStart: 0, maxEnd: 0 };
	}

	const coverage = intervals.reduce((sum, interval) => sum + getIntervalSize(interval), 0);
	const starts = intervals.map((interval) => interval.start);
	const ends = intervals.map((interval) => interval.end);

	return {
		count: intervals.length,
		totalCoverage: coverage,
		minStart: Math.min(...starts),
		maxEnd: Math.max(...ends),
	};
};

/**
 * Get current memory usage statistics from process.memoryUsage().
 * @returns {Object} Memory usage object with all metrics in bytes and MB
 * @returns {Object} returns.rss - Resident Set Size
 * @returns {Object} returns.heapTotal - Total heap memory
 * @returns {Object} returns.heapUsed - Used heap memory
 * @returns {Object} returns.external - External memory usage
 * @returns {Object} returns.arrayBuffers - Array buffer memory usage
 */
export const getMemoryUsage = () => {
	const memUsage = process.memoryUsage();

	return {
		rss: {
			bytes: memUsage.rss,
			mb: Math.round((memUsage.rss / 1024 / 1024) * 100) / 100,
		},
		heapTotal: {
			bytes: memUsage.heapTotal,
			mb: Math.round((memUsage.heapTotal / 1024 / 1024) * 100) / 100,
		},
		heapUsed: {
			bytes: memUsage.heapUsed,
			mb: Math.round((memUsage.heapUsed / 1024 / 1024) * 100) / 100,
		},
		external: {
			bytes: memUsage.external,
			mb: Math.round((memUsage.external / 1024 / 1024) * 100) / 100,
		},
		arrayBuffers: {
			bytes: memUsage.arrayBuffers,
			mb: Math.round((memUsage.arrayBuffers / 1024 / 1024) * 100) / 100,
		},
	};
};

/**
 * Execute a function and measure memory usage and execution time.
 * @param {Function} fn - Function to execute and measure
 * @param {string} [label="operation"] - Label for the measurement
 * @returns {Promise<Object>} Measurement results with timing, memory, and function result
 * @returns {string} returns.label - Label for this measurement
 * @returns {any} returns.result - Result from the executed function
 * @returns {Error|null} returns.error - Error if function threw, null otherwise
 * @returns {Object} returns.executionTime - Execution time in nanoseconds and milliseconds
 * @returns {Object} returns.startMemory - Memory usage before execution
 * @returns {Object} returns.endMemory - Memory usage after execution
 * @returns {Object} returns.memoryDiff - Memory usage differences
 * @returns {Object} returns.summary - Summary with peak usage and growth
 */
export const measureMemoryUsage = async (fn, label = "operation") => {
	if (global.gc) {
global.gc();
}

	const startTime = process.hrtime.bigint();
	const startMemory = getMemoryUsage();

	let result;
	let error = null;

	try {
		result = await fn();
	} catch (err) {
		error = err;
	}

	const endTime = process.hrtime.bigint();
	const endMemory = getMemoryUsage();

	// Calculate differences
	const executionTime = {
		nanoseconds: Number(endTime - startTime),
		milliseconds: Math.round((Number(endTime - startTime) / 1000000) * 100) / 100,
	};

	const memoryDiff = {
		rss: {
			bytes: endMemory.rss.bytes - startMemory.rss.bytes,
			mb: Math.round(((endMemory.rss.bytes - startMemory.rss.bytes) / 1024 / 1024) * 100) / 100,
		},
		heapUsed: {
			bytes: endMemory.heapUsed.bytes - startMemory.heapUsed.bytes,
			mb: Math.round(((endMemory.heapUsed.bytes - startMemory.heapUsed.bytes) / 1024 / 1024) * 100) / 100,
		},
		heapTotal: {
			bytes: endMemory.heapTotal.bytes - startMemory.heapTotal.bytes,
			mb: Math.round(((endMemory.heapTotal.bytes - startMemory.heapTotal.bytes) / 1024 / 1024) * 100) / 100,
		},
	};

	return {
		label,
		result,
		error,
		executionTime,
		startMemory,
		endMemory,
		memoryDiff,
		summary: {
			peakHeapUsed: Math.max(startMemory.heapUsed.mb, endMemory.heapUsed.mb),
			memoryGrowth: memoryDiff.heapUsed.mb,
			executionTimeMs: executionTime.milliseconds,
		},
	};
};

/**
 * Get comprehensive statistics including memory usage and optional processing stats.
 * @param {Object[]} intervals - Array of interval objects to analyze
 * @param {Function|null} [processFunction=null] - Optional function to measure during execution
 * @returns {Promise<Object>} Comprehensive statistics object
 * @returns {Object} returns.intervals - Basic interval statistics
 * @returns {Object} returns.memory - Current memory usage
 * @returns {Object|null} returns.processing - Processing measurement stats (if processFunction provided)
 * @returns {string} returns.timestamp - ISO timestamp of when stats were collected
 */
export const getComprehensiveStatistics = async (intervals, processFunction = null) => {
	const basicStats = getBasicStatistics(intervals);
	const memoryStats = getMemoryUsage();

	let processingStats = null;

	if (processFunction && typeof processFunction === "function") {
		processingStats = await measureMemoryUsage(() => processFunction(intervals), "interval-processing");
	}

	return {
		intervals: basicStats,
		memory: memoryStats,
		processing: processingStats,
		timestamp: new Date().toISOString(),
	};
};
