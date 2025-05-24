import React from 'react';
import { Progress } from '@/components/ui/progress';

const VideoProgressDisplay = ({ progressPercent, totalWatchedDuration, formatTime }) => {
  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold text-foreground">Your Progress:</h2>
        <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
          {progressPercent.toFixed(1)}%
        </span>
      </div>
      <Progress value={progressPercent} className="w-full h-3" aria-label="Video watch progress" />
      <p className="text-xs text-muted-foreground mt-1">
        Total unique time watched: {formatTime(totalWatchedDuration)}
      </p>
    </div>
  );
};

export default VideoProgressDisplay;