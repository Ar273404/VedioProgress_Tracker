import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useVideoPlayer } from '@/hooks/useVideoPlayer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, Tv2 } from 'lucide-react';
import { motion } from 'framer-motion';
import VideoPlayerControls from '@/components/video-player/VideoPlayerControls';
import VideoProgressDisplay from '@/components/video-player/VideoProgressDisplay';
import VideoInfo from '@/components/video-player/VideoInfo';
import { useNavigate } from 'react-router-dom';


const VideoPlayerPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const {
    videoRef,
    playerContainerRef,
    videoData,
    isPlaying,
    currentTime,
    videoDuration,
    volume,
    isMuted,
    isFullscreen,
    showControls,
    totalWatchedDuration,
    progressPercent,
    togglePlayPause,
    handleSeek,
    handleVolumeChange,
    toggleMute,
    skipTime,
    toggleFullscreen,
    handleMouseMove,
    handleMouseLeave,
    formatTime,
  } = useVideoPlayer(user);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <p className="text-xl mb-4">Please log in to watch videos.</p>
        <Button onClick={() => navigate('/login')}>Go to Login</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8 bg-gradient-to-br from-background via-primary/5 to-accent/10">
      <motion.div
        className="w-full max-w-4xl"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="shadow-2xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2"><Tv2 className="inline-block" /> {videoData.title}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Welcome, {user.name || user.email}! Your progress is being saved.</p>
            </div>
            <Button variant="ghost" onClick={logout} title="Logout">
              <LogOut size={20} /> <span className="ml-2 hidden sm:inline">Logout</span>
            </Button>
          </CardHeader>
          <CardContent>
            <div
              ref={playerContainerRef}
              className="relative aspect-video bg-black rounded-lg overflow-hidden group"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <video
                ref={videoRef}
                src={videoData.url}
                className="w-full h-full"
                onClick={togglePlayPause}
                onDoubleClick={toggleFullscreen}
              />
              <VideoPlayerControls
                isPlaying={isPlaying}
                currentTime={currentTime}
                videoDuration={videoDuration}
                volume={volume}
                isMuted={isMuted}
                isFullscreen={isFullscreen}
                showControls={showControls}
                onPlayPause={togglePlayPause}
                onSeek={handleSeek}
                onVolumeChange={handleVolumeChange}
                onMuteToggle={toggleMute}
                onSkipTime={skipTime}
                onFullscreenToggle={toggleFullscreen}
                formatTime={formatTime}
              />
            </div>
            <VideoProgressDisplay
              progressPercent={progressPercent}
              totalWatchedDuration={totalWatchedDuration}
              formatTime={formatTime}
            />
            <VideoInfo title={videoData.title} description={videoData.description} />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default VideoPlayerPage;