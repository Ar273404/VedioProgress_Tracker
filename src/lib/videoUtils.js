export const mergeIntervals = (intervals) => {
  if (!intervals || intervals.length === 0) {
    return [];
  }

  intervals.sort((a, b) => a.start - b.start);

  const merged = [];
  let currentInterval = intervals[0];

  for (let i = 1; i < intervals.length; i++) {
    const nextInterval = intervals[i];
    if (nextInterval.start <= currentInterval.end) {
      currentInterval.end = Math.max(currentInterval.end, nextInterval.end);
    } else {
      merged.push(currentInterval);
      currentInterval = nextInterval;
    }
  }
  merged.push(currentInterval);
  return merged;
};

export const calculateWatchedDuration = (intervals) => {
  let totalDuration = 0;
  for (const interval of intervals) {
    totalDuration += (interval.end - interval.start);
  }
  return totalDuration;
};

export const getVideoProgressKey = (userId, videoId) => `videoProgress_${userId}_${videoId}`;