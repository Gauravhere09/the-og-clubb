
import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import { AudioWaveform } from "@/components/ui/audio-waveform";

interface AudioPlayerProps {
  src: string;
  title?: string;
  artist?: string;
  coverArt?: string;
  onEnded?: () => void;
  className?: string;
  showWaveform?: boolean;
}

export function AudioPlayer({
  src,
  title = "Untitled Track",
  artist = "Unknown Artist",
  coverArt,
  onEnded,
  className = "",
  showWaveform = true
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Load audio metadata when src changes
  useEffect(() => {
    setIsLoaded(false);
    setIsPlaying(false);
    setCurrentTime(0);
    
    if (audioRef.current) {
      audioRef.current.load();
    }
  }, [src]);

  // Handle audio events
  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    const handleLoadedMetadata = () => {
      setDuration(audioElement.duration);
      setIsLoaded(true);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audioElement.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      onEnded?.();
    };

    audioElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    audioElement.addEventListener('timeupdate', handleTimeUpdate);
    audioElement.addEventListener('ended', handleEnded);

    return () => {
      audioElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audioElement.removeEventListener('timeupdate', handleTimeUpdate);
      audioElement.removeEventListener('ended', handleEnded);
    };
  }, [onEnded]);

  // Handle play/pause
  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    if (isPlaying) {
      audioElement.play().catch((error) => {
        console.error("Error playing audio:", error);
        setIsPlaying(false);
      });
    } else {
      audioElement.pause();
    }
  }, [isPlaying]);

  // Handle volume changes
  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;
    
    audioElement.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (isLoaded) {
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleSeek = (value: number[]) => {
    const audioElement = audioRef.current;
    if (audioElement) {
      const newTime = value[0];
      audioElement.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    
    if (isMuted && newVolume > 0) {
      setIsMuted(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className={`audio-player ${className}`}>
      <audio ref={audioRef} src={src} preload="metadata" />
      
      <div className="flex items-center gap-4 mb-4">
        {coverArt && (
          <img 
            src={coverArt}
            alt={`Cover art for ${title}`}
            className="w-16 h-16 object-cover rounded-md"
          />
        )}
        <div className="flex-1">
          <h3 className="font-bold truncate">{title}</h3>
          <p className="text-sm text-muted-foreground">{artist}</p>
        </div>
      </div>
      
      {showWaveform && isLoaded && (
        <AudioWaveform 
          audioUrl={src} 
          playing={isPlaying} 
          className="mb-2"
        />
      )}
      
      <div className="space-y-2 mt-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground w-10">
            {formatTime(currentTime)}
          </span>
          <Slider
            value={[currentTime]}
            min={0}
            max={duration || 100}
            step={0.1}
            onValueChange={handleSeek}
            className="flex-1"
          />
          <span className="text-xs text-muted-foreground w-10 text-right">
            {formatTime(duration)}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              disabled={!isLoaded}
              onClick={togglePlay}
              className="h-10 w-10"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              className="h-8 w-8"
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
            
            <Slider
              value={[isMuted ? 0 : volume]}
              min={0}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
              className="w-24"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
