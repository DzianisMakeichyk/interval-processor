import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { IntervalProcessor } from "../core/IntervalProcessor.js";
import { Interval } from "../core/Interval.js";
import { parseIntervals } from "../utils/parsers.js";
import { validateFileInput, validateCliArgs } from "../utils/validators.js";
import { getComprehensiveStatistics } from "../utils/statistics.js";
import { formatOutput, formatError, formatSuccess, formatInfo, formatHighlight, formatMuted } from "./formatters.js";

/**
 * Process intervals from command line arguments with comprehensive statistics.
 * @param {string} includes - Include intervals string
 * @param {string} excludes - Exclude intervals string
 * @returns {Promise<Object>} Processing result with intervals, formatted output, and comprehensive stats
 * @throws {Error} When validation fails or processing errors occur
 */
export const processFromArgs = async (includes, excludes) => {
	try {
		const validation = validateCliArgs(includes, excludes);

		if (!validation.valid) {
			throw new Error(validation.error);
		}

		const includesIntervals = parseIntervals(includes);
		const stats = await getComprehensiveStatistics(includesIntervals, () =>
			IntervalProcessor.process({
				includes,
				excludes: excludes ?? "",
			})
		);

		return {
			...stats.processing.result,
			comprehensiveStats: stats,
		};
	} catch (error) {
		throw new Error(`Processing failed: ${error?.message ?? "Unknown error"}`);
	}
};

/**
 * Process intervals from a JSON file - supports both single object and array of objects.
 * @param {string} filePath - Path to the JSON file containing interval data
 * @returns {Promise<Object[]>} Array of processing results with comprehensive statistics
 * @throws {Error} When file reading, JSON parsing, validation, or processing fails
 */
export const processFromFile = async (filePath) => {
	try {
		const absolutePath = resolve(filePath);
		const content = await readFile(absolutePath, { encoding: "utf8" });
		let data;

		try {
			data = JSON.parse(content);
		} catch {
			throw new Error("Invalid JSON format in file");
		}

		const validation = validateFileInput(data);

		if (!validation.valid) {
			throw new Error(validation.error);
		}

		if (Array.isArray(data)) {
			return processArrayOfObjects(data);
		}

		const includesIntervals = parseIntervals(data.includes);

		const stats = await getComprehensiveStatistics(includesIntervals, () =>
			IntervalProcessor.process({
				includes: data.includes,
				excludes: data.excludes ?? "",
			})
		);

		return {
			...stats.processing.result,
			comprehensiveStats: stats,
		};
	} catch (error) {
		const message = error?.message ?? "Unknown error";

		if (error?.code === "ENOENT") {
			throw new Error(`File not found: ${filePath}`);
		} else if (error?.code === "EACCES") {
			throw new Error(`Permission denied: ${filePath}`);
		} else {
			throw new Error(`File processing failed: ${message}`);
		}
	}
};

const processArrayOfObjects = async (dataArray) => {
	const allResults = [];
	const allStats = [];

	for (let i = 0; i < dataArray.length; i++) {
		const item = dataArray[i];
		const includesIntervals = parseIntervals(item.includes);

		const stats = await getComprehensiveStatistics(includesIntervals, () =>
			IntervalProcessor.process({
				includes: item.includes,
				excludes: item.excludes ?? "",
			})
		);

		allStats.push(stats);

		allResults.push({
			index: i + 1,
			includes: Array.isArray(item.includes) ? item.includes.join(", ") : item.includes,
			excludes: item.excludes ? (Array.isArray(item.excludes) ? item.excludes.join(", ") : item.excludes) : "(none)",
			result: stats.processing.result.formatted,
			intervals: stats.processing.result.intervals,
			comprehensiveStats: stats,
		});
	}

	const combinedIntervals = allResults.flatMap((r) => r.intervals);

	return {
		multipleResults: allResults,
		intervals: combinedIntervals,
		formatted: allResults.map((r) => `Set ${r.index}: ${r.result}`).join("\n"),
		allComprehensiveStats: allStats,
	};
};

const displayMultipleResults = (result) => {
	console.log("");
	console.log(formatHighlight("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
	console.log(formatHighlight("                🔢 MULTIPLE INTERVAL SETS RESULTS"));
	console.log(formatHighlight("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
	console.log("");

	result.multipleResults.forEach((setResult, index) => {
		console.log(formatInfo(`📋 Set ${setResult.index}:`));
		console.log(formatInfo(`   📥 Includes:`), formatOutput(setResult.includes));
		console.log(formatInfo(`   📤 Excludes:`), formatOutput(setResult.excludes));
		console.log(formatSuccess(`   ✨ Result:`), formatHighlight(setResult.result));

		if (index < result.multipleResults.length - 1) {
			console.log("");
		}
	});

	// Overall statistics
	if (result.intervals.length > 0) {
		const allIntervalObjects = result.intervals.map((i) => Interval.fromObject(i));

		console.log("");
		console.log(formatMuted("📈 OVERALL STATISTICS:"));
		console.log(formatMuted(`   • Total sets processed: ${result.multipleResults.length}`));
		console.log(formatMuted(`   • Total intervals: ${allIntervalObjects.length}`));
		console.log(
			formatMuted(
				`   • Total coverage: ${allIntervalObjects.reduce((sum, interval) => sum + (interval.end - interval.start + 1), 0)} individual numbers`
			)
		);

		// Memory usage summary
		if (result.allComprehensiveStats && result.allComprehensiveStats.length > 0) {
			const totalExecutionTime = result.allComprehensiveStats.reduce(
				(sum, s) => sum + (s.processing ? s.processing.summary.executionTimeMs : 0),
				0
			);
			const avgMemoryGrowth =
				result.allComprehensiveStats.reduce((sum, s) => sum + (s.processing ? s.processing.summary.memoryGrowth : 0), 0) /
				result.allComprehensiveStats.length;
			const maxPeakHeap = Math.max(...result.allComprehensiveStats.map((s) => (s.processing ? s.processing.summary.peakHeapUsed : 0)));

			console.log("");
			console.log(formatMuted("⚡ PERFORMANCE SUMMARY:"));
			console.log(formatMuted(`   • Total execution time: ${totalExecutionTime.toFixed(2)} ms`));
			console.log(formatMuted(`   • Average memory growth per set: ${avgMemoryGrowth.toFixed(2)} MB`));
			console.log(formatMuted(`   • Peak heap usage: ${maxPeakHeap.toFixed(2)} MB`));
		}
	}

	console.log("");
	console.log(formatHighlight("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
	console.log("");
};

/**
 * Main CLI command handler that processes options and displays results.
 * @param {Object} options - Command line options object
 * @param {string} [options.includes] - Include intervals string
 * @param {string} [options.excludes] - Exclude intervals string
 * @param {string} [options.file] - File path for JSON input
 * @param {boolean} [options.help] - Show help flag
 * @returns {Promise<void>} Resolves when command processing is complete
 * @throws {Error} When processing fails or invalid options provided
 */
export const handleCommand = async (options) => {
	try {
		let result;
		let includesInput = "";
		let excludesInput = "";

		if (options.file) {
			console.log(formatInfo(`📁 Reading from file: ${options.file}`));
			result = await processFromFile(options.file);

			const { readFile } = await import("node:fs/promises");
			const { resolve } = await import("node:path");
			const content = await readFile(resolve(options.file), {
				encoding: "utf8",
			});
			const fileData = JSON.parse(content);

			if (Array.isArray(fileData)) {
				return displayMultipleResults(result);
			}

			includesInput = Array.isArray(fileData.includes) ? fileData.includes.join(", ") : fileData.includes;
			excludesInput = fileData.excludes ? (Array.isArray(fileData.excludes) ? fileData.excludes.join(", ") : fileData.excludes) : "";
		} else if (options.includes !== undefined && options.includes !== null) {
			includesInput = options.includes;
			excludesInput = options.excludes || "";
			result = await processFromArgs(options.includes, options.excludes);
		} else {
			throw new Error("No input provided. Use -i for includes or --file for file input.");
		}

		// Display beautiful formatted results
		console.log("");
		console.log(formatHighlight("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
		console.log(formatHighlight("                    🔢 INTERVAL PROCESSOR RESULTS"));
		console.log(formatHighlight("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
		console.log("");

		console.log(formatInfo(`📥 Includes:`), formatOutput(includesInput));
		if (excludesInput) {
			console.log(formatInfo(`📤 Excludes:`), formatOutput(excludesInput));
		} else {
			console.log(formatMuted(`📤 Excludes: (none)`));
		}

		console.log("");
		console.log(formatSuccess(`✨ Output:`), formatHighlight(result.formatted));

		if (result.intervals.length > 0) {
			const stats = result.comprehensiveStats;
			let excludedCoverage = 0;

			if (excludesInput) {
				const excludeIntervals = parseIntervals(excludesInput);
				excludedCoverage = excludeIntervals.reduce((sum, interval) => sum + (interval.end - interval.start + 1), 0);
			}

			console.log("");
			console.log(formatMuted("📊 Statistics:"));
			console.log(formatMuted(`   • Number of intervals: ${stats.intervals.count}`));
			console.log(formatMuted(`   • Total coverage: ${stats.intervals.totalCoverage} individual numbers`));

			if (excludedCoverage > 0) {
				console.log(formatMuted(`   • Total excluded: ${excludedCoverage} individual numbers`));
			}

			if (stats.processing) {
				const perf = stats.processing;

				console.log("");
				console.log(formatMuted("⚡ Performance:"));
				console.log(formatMuted(`   • Execution time: ${perf.summary.executionTimeMs} ms`));
				console.log(formatMuted(`   • Memory growth: ${perf.summary.memoryGrowth} MB`));
				console.log(formatMuted(`   • Peak heap used: ${perf.summary.peakHeapUsed} MB`));

				if (perf.error) {
					console.log(formatError(`   • Error occurred: ${perf.error.message}`));
				}
			}
		}

		console.log("");
		console.log(formatHighlight("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
		console.log("");
	} catch (error) {
		console.log("");
		console.error(formatError(`❌ ${error?.message ?? "An unexpected error occurred"}`));
		console.log("");
		process.exit(1);
	}
};

/**
 * Display help information with usage examples and options.
 * @returns {void}
 */
export const showHelp = () => {
	const help = `
${formatHighlight("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")}
${formatHighlight("                  🔢 INTERVAL PROCESSOR CLI v1.0.0")}
${formatHighlight("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")}

${formatInfo("🚀 USAGE:")}
  node cli.js [OPTIONS]

${formatInfo("⚙️  OPTIONS:")}
  ${formatSuccess("-i, --includes <intervals>")}    Include intervals (required unless using --file)
  ${formatInfo("-e, --excludes <intervals>")}    Exclude intervals (optional)
  ${formatInfo("--file <path>")}                Read input from JSON file
  ${formatMuted("--help")}                       Show this help message

${formatInfo("📝 INTERVAL FORMAT:")}
  ${formatMuted("Single interval:")}    ${formatOutput('"10-100"')}
  ${formatMuted("Multiple intervals:")} ${formatOutput('"10-100,200-300,400-500"')}
  ${formatMuted("Negative numbers:")}   ${formatOutput('"-50--10"')} ${formatMuted("(from -50 to -10)")}

${formatInfo("⚠️  NEGATIVE INTERVALS:")}
  ${formatMuted("When using negative intervals, prefer long form options to avoid parsing issues:")}
  ${formatOutput('node cli.js --includes="-10-2" --excludes="-1-1"')}

${formatInfo("💡 EXAMPLES:")}
  ${formatMuted("# Basic usage")}
  ${formatOutput('node cli.js -i "10-100" -e "20-30"')}
  
  ${formatMuted("# Multiple intervals")}
  ${formatOutput('node cli.js -i "50-5000,10-100" -e "95-205"')}
  
  ${formatMuted("# Empty includes (returns 'none')")}
  ${formatOutput('node cli.js -i "" -e "10-50"')}
  
  ${formatMuted("# Negative intervals (use long form)")}
  ${formatOutput('node cli.js --includes="-10-2" --excludes="-5-0"')}
  
  ${formatMuted("# File input")}
  ${formatOutput("node cli.js --file input.json")}

${formatInfo("📄 FILE FORMAT (input.json):")}
  ${formatMuted("Single object format:")}
  ${formatOutput("{")}
  ${formatOutput('  "includes": ["10-100", "200-300"],')}
  ${formatOutput('  "excludes": ["20-30", "250-280"]')}
  ${formatOutput("}")}

  ${formatMuted("Array of objects format (multiple sets):")}
  ${formatOutput("[")}
  ${formatOutput("  {")}
  ${formatOutput('    "includes": ["10-100", "200-300"],')}
  ${formatOutput('    "excludes": ["20-30", "250-280"]')}
  ${formatOutput("  },")}
  ${formatOutput("  {")}
  ${formatOutput('    "includes": ["400-500"],')}
  ${formatOutput('    "excludes": ["450-460"]')}
  ${formatOutput("  }")}
  ${formatOutput("]")}

  ${formatMuted("Alternative string format:")}
  ${formatOutput("{")}
  ${formatOutput('  "includes": "10-100,200-300",')}
  ${formatOutput('  "excludes": "20-30,250-280"')}
  ${formatOutput("}")}

${formatHighlight("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")}
`;
	console.log(help);
};
