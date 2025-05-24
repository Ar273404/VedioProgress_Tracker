import { useState, useRef, useEffect, useCallback } from 'react';
import { mergeIntervals, calculateWatchedDuration, getVideoProgressKey } from '@/lib/videoUtils';
import { useToast } from '@/components/ui/use-toast';

const MOCK_VIDEO_DATA = {
  id: 'video1',
  title: 'Introduction to Modern Web Development',
  url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  duration: 596, 
  description: 'A comprehensive overview of current web development technologies and best practices.'
};


export const useVideoPlayer = (user) => {
  const videoRef = useRef(null);
  const playerContainerRef = useRef(null);
  const { toast } = useToast();

  const [videoData] = useState(MOCK_VIDEO_DATA);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(videoData.duration);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [watchedIntervals, setWatchedIntervals] = useState([]);
  const [totalWatchedDuration, setTotalWatchedDuration] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);

  const videoProgressKey = user ? getVideoProgressKey(user.id, videoData.id) : null;

  const saveProgress = useCallback(() => {
    if (!videoProgressKey || !user) return;
    const merged = mergeIntervals(watchedIntervals);
    const watchedSec = calculateWatchedDuration(merged);
    const currentProgress = videoDuration > 0 ? (watchedSec / videoDuration) * 100 : 0;

    const progressData = {
      intervals: merged,
      lastPosition: videoRef.current ? videoRef.current.currentTime : currentTime,
      progress: currentProgress,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(videoProgressKey, JSON.stringify(progressData));
    setTotalWatchedDuration(watchedSec);
    setProgressPercent(currentProgress);
  }, [watchedIntervals, currentTime, videoDuration, videoProgressKey, user]);

  useEffect(() => {
    if (!videoProgressKey || !user) return;
    const savedProgress = localStorage.getItem(videoProgressKey);
    if (savedProgress) {
      try {
        const data = JSON.parse(savedProgress);
        setWatchedIntervals(data.intervals || []);
        if (videoRef.current && data.lastPosition) {
          videoRef.current.currentTime = data.lastPosition;
          setCurrentTime(data.lastPosition);
        }
        const watchedSec = calculateWatchedDuration(data.intervals || []);
        setTotalWatchedDuration(watchedSec);
        const currentProgress = videoDuration > 0 ? (watchedSec / videoDuration) * 100 : 0;
        setProgressPercent(currentProgress);
        toast({ title: "Progress Loaded", description: "Resumed from your last watched position." });
      } catch (error) {
        console.error("Failed to parse saved progress:", error);
        toast({ variant: "destructive", title: "Load Error", description: "Could not load saved progress." });
      }
    }
  }, [videoProgressKey, toast, videoDuration, user]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const current = video.currentTime;
      setCurrentTime(current);
      if (isPlaying) {
        setWatchedIntervals(prevIntervals => {
          const newIntervals = [...prevIntervals];
          const lastInterval = newIntervals[newIntervals.length - 1];
          if (lastInterval && Math.abs(current - lastInterval.end) < 1.5 && current > lastInterval.start) {
            newIntervals[newIntervals.length - 1] = { ...lastInterval, end: current };
          } else if (current > (lastInterval ? lastInterval.end : -1)) { 
            newIntervals.push({ start: current, end: current + 0.01 }); 
          }
          return newIntervals;
        });
      }
    };

    const handleLoadedMetadata = () => setVideoDuration(video.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => {
      setIsPlaying(false);
      saveProgress();
    };
    const handleEnded = () => {
      setIsPlaying(false);
      saveProgress();
      toast({ title: "Video Finished!", description: `You've completed ${videoData.title}.` });
    };
    const handleVolumeChangeEv = () => {
      if (video) {
        setVolume(video.volume);
        setIsMuted(video.muted);
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('volumechange', handleVolumeChangeEv);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('volumechange', handleVolumeChangeEv);
      saveProgress();
    };
  }, [isPlaying, saveProgress, toast, videoData.title]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (isPlaying) {
        saveProgress();
      }
    }, 5000);
    return () => clearInterval(intervalId);
  }, [isPlaying, saveProgress]);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
    }
  };

  const handleSeek = (value) => {
    if (videoRef.current) {
      const newTime = value[0];
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      setWatchedIntervals(prev => mergeIntervals([...prev, { start: newTime, end: newTime + 0.1 }]));
      saveProgress();
    }
  };

  const handleVolumeChange = (value) => {
    if (videoRef.current) {
      const newVolume = value[0];
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      const muted = newVolume === 0;
      videoRef.current.muted = muted;
      setIsMuted(muted);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMutedState = !isMuted;
      videoRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
      if (!newMutedState && volume === 0) {
        videoRef.current.volume = 0.5;
        setVolume(0.5);
      }
    }
  };

  const skipTime = (seconds) => {
    if (videoRef.current) {
      const newTime = Math.max(0, Math.min(videoDuration, videoRef.current.currentTime + seconds));
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      setWatchedIntervals(prev => mergeIntervals([...prev, { start: newTime, end: newTime + 0.1 }]));
      saveProgress();
    }
  };

  const toggleFullscreen = () => {
    const elem = playerContainerRef.current;
    if (!elem) return;
    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch(err => {
        toast({ variant: "destructive", title: "Fullscreen Error", description: err.message });
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  let controlTimeoutRef = useRef(null);
  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(controlTimeoutRef.current);
    if (isPlaying) {
      controlTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
    }
  };
  
  const handleMouseLeave = () => {
    if (isPlaying) {
      setShowControls(false);
    }
  };


  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  return {
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
  };
};