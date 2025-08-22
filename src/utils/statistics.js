// Calculate the size (number of integers) in an interval
export const getIntervalSize = (interval) => interval.end - interval.start + 1;

// Calculate basic statistics
export const getBasicStatistics = (intervals) => {
  if (!intervals || intervals.length === 0) {
    return { count: 0, totalCoverage: 0, minStart: 0, maxEnd: 0 };
  };

  const coverage = intervals.reduce((sum, interval) => sum + getIntervalSize(interval), 0);
  const starts = intervals.map(interval => interval.start);
  const ends = intervals.map(interval => interval.end);

  return {
    count: intervals.length,
    totalCoverage: coverage,
    minStart: Math.min(...starts),
    maxEnd: Math.max(...ends)
  };
};

// Get current memory usage statistics
export const getMemoryUsage = () => {
  const memUsage = process.memoryUsage();
  
  return {
    rss: {
      bytes: memUsage.rss,
      mb: Math.round((memUsage.rss / 1024 / 1024) * 100) / 100
    },
    heapTotal: {
      bytes: memUsage.heapTotal,
      mb: Math.round((memUsage.heapTotal / 1024 / 1024) * 100) / 100
    },
    heapUsed: {
      bytes: memUsage.heapUsed,
      mb: Math.round((memUsage.heapUsed / 1024 / 1024) * 100) / 100
    },
    external: {
      bytes: memUsage.external,
      mb: Math.round((memUsage.external / 1024 / 1024) * 100) / 100
    },
    arrayBuffers: {
      bytes: memUsage.arrayBuffers,
      mb: Math.round((memUsage.arrayBuffers / 1024 / 1024) * 100) / 100
    }
  };
};

// Execute a function and measure memory usage before and after
export const measureMemoryUsage = async (fn, label = 'operation') => {
  if (global.gc) global.gc();

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
    milliseconds: Math.round(Number(endTime - startTime) / 1000000 * 100) / 100
  };

  const memoryDiff = {
    rss: {
      bytes: endMemory.rss.bytes - startMemory.rss.bytes,
      mb: Math.round((endMemory.rss.bytes - startMemory.rss.bytes) / 1024 / 1024 * 100) / 100
    },
    heapUsed: {
      bytes: endMemory.heapUsed.bytes - startMemory.heapUsed.bytes,
      mb: Math.round((endMemory.heapUsed.bytes - startMemory.heapUsed.bytes) / 1024 / 1024 * 100) / 100
    },
    heapTotal: {
      bytes: endMemory.heapTotal.bytes - startMemory.heapTotal.bytes,
      mb: Math.round((endMemory.heapTotal.bytes - startMemory.heapTotal.bytes) / 1024 / 1024 * 100) / 100
    }
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
      executionTimeMs: executionTime.milliseconds
    }
  };
};

// Get comprehensive statistics including memory usage
export const getComprehensiveStatistics = async (intervals, processFunction = null) => {
  const basicStats = getBasicStatistics(intervals);
  const memoryStats = getMemoryUsage();

  let processingStats = null;
  
  if (processFunction && typeof processFunction === 'function') {
    processingStats = await measureMemoryUsage(
      () => processFunction(intervals),
      'interval-processing'
    );
  }

  return {
    intervals: basicStats,
    memory: memoryStats,
    processing: processingStats,
    timestamp: new Date().toISOString()
  };
};
