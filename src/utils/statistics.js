// Calculate basic statistics
export const getBasicStatistics = (intervals) => {
  if (!intervals || intervals.length === 0) {
    return { count: 0, totalCoverage: 0, minStart: 0, maxEnd: 0 };
  };

  const coverage = intervals.reduce((sum, interval) => sum + interval.size(), 0);
  const starts = intervals.map(interval => interval.start);
  const ends = intervals.map(interval => interval.end);

  return {
    count: intervals.length,
    totalCoverage: coverage,
    minStart: Math.min(...starts),
    maxEnd: Math.max(...ends)
  };
};

// Analyze coverage efficiency of intervals
export const analyzeCoverage = (intervals) => {
  if (!intervals || intervals.length === 0) {
    return { 
      efficiency: 0, 
      totalRange: 0, 
      actualCoverage: 0,
      wastedSpace: 0
    };
  }

  const stats = getBasicStatistics(intervals);
  const totalRange = stats.maxEnd - stats.minStart + 1; // +1 because inclusive
  const efficiency = totalRange > 0 ? (stats.totalCoverage / totalRange) * 100 : 0;
  const wastedSpace = totalRange - stats.totalCoverage;

  return {
    efficiency: Math.round(efficiency * 100) / 100, // Round to 2 decimal places
    totalRange: totalRange,
    actualCoverage: stats.totalCoverage,
    wastedSpace: wastedSpace
  };
};
