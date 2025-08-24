import { IntervalProcessor } from './src/core/IntervalProcessor.js';

/**
 * Generate non-overlapping intervals for performance testing
 * @param {number} count - Number of intervals to generate
 * @param {number} startRange - Starting point for interval generation
 * @param {number} spacing - Spacing between intervals
 * @returns {string[]} Array of interval strings
 */
function generateNonOverlappingIntervals(count, startRange = 1, spacing = 10) {
    const intervals = [];
    let current = startRange;
    
    for (let i = 0; i < count; i++) {
        const start = current;
        const end = current + Math.floor(Math.random() * 5) + 1; // Random interval size 1-6
        intervals.push(`${start}-${end}`);
        current = end + spacing;
    }
    
    return intervals;
}

function runPerformanceTest() {
    console.log('🚀 Starting Performance Test');
    console.log('=' .repeat(50));
    console.log('\n📊 Generating test data...');

    const includeIntervals = generateNonOverlappingIntervals(10000, 1, 10);
    const excludeIntervals = generateNonOverlappingIntervals(10000, 500000, 10);
    
    console.log(`✅ Generated ${includeIntervals.length} include intervals`);
    console.log(`✅ Generated ${excludeIntervals.length} exclude intervals`);
    console.log('\n📝 Sample intervals:');
    console.log('Includes (first 5):', includeIntervals.slice(0, 5));
    console.log('Excludes (first 5):', excludeIntervals.slice(0, 5));
    
    const testInput = {
        includes: includeIntervals.join(', '),
        excludes: excludeIntervals.join(', ')
    };
    
    console.log('\n� Starting Interval Processing...');
    const startTime = performance.now();
    
    const result = IntervalProcessor.process(testInput);
    
    const endTime = performance.now();
    const processingTime = (endTime - startTime).toFixed(2);
    
    console.log(`✅ Interval Processing completed in ${processingTime}ms`);
    
    // Display results
    console.log('\n📈 Performance Test Results:');
    console.log('=' .repeat(50));
    console.log(`⏱️  Processing time: ${processingTime}ms`);
    console.log(`📊 Input intervals: ${includeIntervals.length} includes + ${excludeIntervals.length} excludes`);
    console.log(`📋 Output intervals: ${result.intervals.length}`);
    console.log(`📝 Output sample: ${result.formatted.length > 100 ? result.formatted.substring(0, 100) + '...' : result.formatted}`);
    
    const memUsage = process.memoryUsage();
    console.log(`💾 Heap Used: ${(memUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`);
    
    console.log('\n🎉 Performance test completed!');
}

if (import.meta.url === `file://${process.argv[1]}`) {
    runPerformanceTest();
}
