import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { IntervalProcessor } from '../core/IntervalProcessor.js';
import { Interval } from '../core/Interval.js';
import { parseIntervals } from '../utils/parsers.js';
import { validateFileInput, validateCliArgs } from '../utils/validators.js';
import { getBasicStatistics } from '../utils/statistics.js';
import { 
  formatOutput, 
  formatError, 
  formatSuccess, 
  formatInfo, 
  formatHighlight, 
  formatMuted 
} from './formatters.js';

// Process intervals from command line arguments
export const processFromArgs = (includes, excludes) => {
  try {
    // Validate inputs
    const validation = validateCliArgs(includes, excludes);

    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Process intervals
    const result = IntervalProcessor.process({
      includes,
      excludes: excludes ?? ''
    });

    return result;

  } catch (error) {
    throw new Error(`Processing failed: ${error?.message ?? 'Unknown error'}`);
  }
};

// Process intervals from a JSON file - supports both single object and array of objects
export const processFromFile = async (filePath) => {
  try {
    const absolutePath = resolve(filePath);
    const content = await readFile(absolutePath, { encoding: 'utf8' });
    
    // Parse JSON
    let data;
    try {
      data = JSON.parse(content);
    } catch {
      throw new Error('Invalid JSON format in file');
    };

    const validation = validateFileInput(data);

    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Handle array of objects format
    if (Array.isArray(data)) {
      return processArrayOfObjects(data);
    }

    // Handle single object format (backward compatibility)
    const result = IntervalProcessor.process({
      includes: data.includes,
      excludes: data.excludes ?? ''
    });

    return result;
  } catch (error) {
    // Enhanced error messages with nullish coalescing
    const message = error?.message ?? 'Unknown error';
    
    if (error?.code === 'ENOENT') {
      throw new Error(`File not found: ${filePath}`);
    } else if (error?.code === 'EACCES') {
      throw new Error(`Permission denied: ${filePath}`);
    } else {
      throw new Error(`File processing failed: ${message}`);
    }
  }
};

// Process an array of interval objects
const processArrayOfObjects = (dataArray) => {
  const allResults = [];
  
  for (let i = 0; i < dataArray.length; i++) {
    const item = dataArray[i];
    const result = IntervalProcessor.process({
      includes: item.includes,
      excludes: item.excludes ?? ''
    });
    
    allResults.push({
      index: i + 1,
      includes: Array.isArray(item.includes) ? item.includes.join(', ') : item.includes,
      excludes: item.excludes ? (Array.isArray(item.excludes) ? item.excludes.join(', ') : item.excludes) : '(none)',
      result: result.formatted,
      intervals: result.intervals
    });
  }

  // Combine all intervals for overall statistics
  const combinedIntervals = allResults.flatMap(r => r.intervals);
  
  return {
    multipleResults: allResults,
    intervals: combinedIntervals,
    formatted: allResults.map(r => `Set ${r.index}: ${r.result}`).join('\n')
  };
};

// Display results for multiple interval sets
const displayMultipleResults = (result) => {
  console.log('');
  console.log(formatHighlight('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log(formatHighlight('                🔢 MULTIPLE INTERVAL SETS RESULTS'));
  console.log(formatHighlight('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log('');

  result.multipleResults.forEach((setResult, index) => {
    console.log(formatInfo(`📋 Set ${setResult.index}:`));
    console.log(formatInfo(`   📥 Includes:`), formatOutput(setResult.includes));
    console.log(formatInfo(`   📤 Excludes:`), formatOutput(setResult.excludes));
    console.log(formatSuccess(`   ✨ Result:`), formatHighlight(setResult.result));
    
    if (index < result.multipleResults.length - 1) {
      console.log('');
    }
  });

  // Overall statistics
  if (result.intervals.length > 0) {
    const allIntervalObjects = result.intervals.map(i => Interval.fromObject(i));
    const overallStats = getBasicStatistics(allIntervalObjects);
    
    console.log('');
    console.log(formatMuted('📈 OVERALL STATISTICS:'));
    console.log(formatMuted(`   • Total sets processed: ${result.multipleResults.length}`));
    console.log(formatMuted(`   • Total intervals: ${overallStats.count}`));
    console.log(formatMuted(`   • Total coverage: ${overallStats.totalCoverage} individual numbers`));
    if (overallStats.count > 0) {
      console.log(formatMuted(`   • Range: ${overallStats.minStart} to ${overallStats.maxEnd}`));
    }
  }

  console.log('');
  console.log(formatHighlight('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log('');
};

// Main CLI handler
export const handleCommand = async (options) => {
  try {
    let result;
    let includesInput = '';
    let excludesInput = '';

    if (options.file) {
      // File mode
      console.log(formatInfo(`📁 Reading from file: ${options.file}`));
      result = await processFromFile(options.file);
      
      // Read file to determine display format
      const { readFile } = await import('node:fs/promises');
      const { resolve } = await import('node:path');
      const content = await readFile(resolve(options.file), { encoding: 'utf8' });
      const fileData = JSON.parse(content);
      
      // Handle array of objects display
      if (Array.isArray(fileData)) {
        return displayMultipleResults(result);
      }
      
      // Handle single object display
      includesInput = Array.isArray(fileData.includes) ? fileData.includes.join(', ') : fileData.includes;
      excludesInput = fileData.excludes ? (Array.isArray(fileData.excludes) ? fileData.excludes.join(', ') : fileData.excludes) : '';
    } else if (options.includes) {
      // Direct input mode
      includesInput = options.includes;
      excludesInput = options.excludes || '';
      result = processFromArgs(options.includes, options.excludes);
    } else {
      throw new Error('No input provided. Use -i for includes or --file for file input.');
    }

    // Display beautiful formatted results
    console.log('');
    console.log(formatHighlight('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    console.log(formatHighlight('                    🔢 INTERVAL PROCESSOR RESULTS'));
    console.log(formatHighlight('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    console.log('');
    
    console.log(formatInfo(`📥 Includes:`), formatOutput(includesInput));
    if (excludesInput) {
      console.log(formatInfo(`📤 Excludes:`), formatOutput(excludesInput));
    } else {
      console.log(formatMuted(`📤 Excludes: (none)`));
    }
    
    console.log('');
    console.log(formatSuccess(`✨ Output:`), formatHighlight(result.formatted));
    
    // Show statistics if there are intervals
    if (result.intervals.length > 0) {
      const intervalObjects = result.intervals.map(i => Interval.fromObject(i));
      const stats = getBasicStatistics(intervalObjects);
      
      // Calculate excluded coverage
      let excludedCoverage = 0;
      if (excludesInput) {
        const excludeIntervals = parseIntervals(excludesInput);
        const excludeStats = getBasicStatistics(excludeIntervals);
        excludedCoverage = excludeStats.totalCoverage;
      }
      
      console.log('');
      console.log(formatMuted('📊 Statistics:'));
      console.log(formatMuted(`   • Number of intervals: ${stats.count}`));
      console.log(formatMuted(`   • Total coverage: ${stats.totalCoverage} individual numbers`));
      if (excludedCoverage > 0) {
        console.log(formatMuted(`   • Total excluded: ${excludedCoverage} individual numbers`));
      }
      console.log(formatMuted(`   • Range: ${stats.minStart} to ${stats.maxEnd}`));
    }
    
    console.log('');
    console.log(formatHighlight('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    console.log('');
  } catch (error) {
    console.log('');
    console.error(formatError(`❌ ${error?.message ?? 'An unexpected error occurred'}`));
    console.log('');
    process.exit(1);
  }
};

// Display help information
export const showHelp = () => {
  const help = `
${formatHighlight('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')}
${formatHighlight('                  🔢 INTERVAL PROCESSOR CLI v1.0.0')}
${formatHighlight('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')}

${formatInfo('🚀 USAGE:')}
  node cli.js [OPTIONS]

${formatInfo('⚙️  OPTIONS:')}
  ${formatSuccess('-i, --includes <intervals>')}    Include intervals (required unless using --file)
  ${formatInfo('-e, --excludes <intervals>')}    Exclude intervals (optional)
  ${formatInfo('--file <path>')}                Read input from JSON file
  ${formatMuted('--help')}                       Show this help message

${formatInfo('📝 INTERVAL FORMAT:')}
  ${formatMuted('Single interval:')}    ${formatOutput('"10-100"')}
  ${formatMuted('Multiple intervals:')} ${formatOutput('"10-100,200-300,400-500"')}
  ${formatMuted('Negative numbers:')}   ${formatOutput('"-50--10"')} ${formatMuted('(from -50 to -10)')}

${formatInfo('💡 EXAMPLES:')}
  ${formatMuted('# Basic usage')}
  ${formatOutput('node cli.js -i "10-100" -e "20-30"')}
  
  ${formatMuted('# Multiple intervals')}
  ${formatOutput('node cli.js -i "50-5000,10-100" -e "95-205"')}
  
  ${formatMuted('# File input')}
  ${formatOutput('node cli.js --file input.json')}

${formatInfo('📄 FILE FORMAT (input.json):')}
  ${formatMuted('Single object format:')}
  ${formatOutput('{')}
  ${formatOutput('  "includes": ["10-100", "200-300"],')}
  ${formatOutput('  "excludes": ["20-30", "250-280"]')}
  ${formatOutput('}')}

  ${formatMuted('Array of objects format (multiple sets):')}
  ${formatOutput('[')}
  ${formatOutput('  {')}
  ${formatOutput('    "includes": ["10-100", "200-300"],')}
  ${formatOutput('    "excludes": ["20-30", "250-280"]')}
  ${formatOutput('  },')}
  ${formatOutput('  {')}
  ${formatOutput('    "includes": ["400-500"],')}
  ${formatOutput('    "excludes": ["450-460"]')}
  ${formatOutput('  }')}
  ${formatOutput(']')}

  ${formatMuted('Alternative string format:')}
  ${formatOutput('{')}
  ${formatOutput('  "includes": "10-100,200-300",')}
  ${formatOutput('  "excludes": "20-30,250-280"')}
  ${formatOutput('}')}

${formatInfo('⚡ ALGORITHM:')}
  Uses Sweep Line Algorithm with ${formatHighlight('O(n log n)')} complexity
  for optimal performance on large datasets.

${formatHighlight('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')}
`;
  console.log(help);
};
