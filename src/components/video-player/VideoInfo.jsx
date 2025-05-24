import React from 'react';

const VideoInfo = ({ title, description }) => {
  return (
    <div className="mt-4 p-4 bg-secondary/50 rounded-lg">
      <h3 className="text-md font-semibold mb-1">About this Video:</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
};

export default VideoInfo;