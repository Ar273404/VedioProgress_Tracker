import React from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Rewind, FastForward, Volume2, VolumeX, Maximize } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VideoPlayerControls = ({
  isPlaying,
  currentTime,
  videoDuration,
  volume,
  isMuted,
  isFullscreen,
  showControls,
  onPlayPause,
  onSeek,
  onVolumeChange,
  onMuteToggle,
  onSkipTime,
  onFullscreenToggle,
  formatTime,
}) => {
  return (
    <AnimatePresence>
      {showControls && (
        <motion.div
          className="absolute inset-0 bg-black/40 flex flex-col justify-between p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div>{/* Top controls placeholder if needed */}</div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Slider
                value={[currentTime]}
                max={videoDuration}
                step={0.1}
                onValueChange={onSeek}
                className="w-full cursor-pointer"
                aria-label="Video progress slider"
              />
            </div>
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-1 sm:gap-3">
                <Button variant="ghost" size="icon" onClick={() => onSkipTime(-10)} title="Rewind 10s"><Rewind size={20} /></Button>
                <Button variant="ghost" size="icon" onClick={onPlayPause} title={isPlaying ? "Pause" : "Play"}>
                  {isPlaying ? <Pause size={28} /> : <Play size={28} />}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onSkipTime(10)} title="Fast Forward 10s"><FastForward size={20} /></Button>
                <Button variant="ghost" size="icon" onClick={onMuteToggle} title={isMuted ? "Unmute" : "Mute"}>
                  {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={1}
                  step={0.05}
                  onValueChange={onVolumeChange}
                  className="w-16 sm:w-24 cursor-pointer"
                  aria-label="Volume slider"
                />
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-xs sm:text-sm">{formatTime(currentTime)} / {formatTime(videoDuration)}</span>
                <Button variant="ghost" size="icon" onClick={onFullscreenToggle} title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
                  <Maximize size={20} />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VideoPlayerControls;