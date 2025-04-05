
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AudioWaveform } from "@/components/ui/audio-waveform";
import { Navbar } from "@/components/navbar";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Heart,
  Share,
  MessageSquare,
  Download,
  Clock,
  ArrowLeft
} from "lucide-react";

// Mock data for audio tracks
const audioTracks = [
  {
    id: '1',
    title: 'Deep Forest Ambience',
    artist: 'NatureSounds',
    artistId: 'user1',
    description: 'Immerse yourself in the peaceful sounds of a deep forest. Perfect for relaxation, meditation, or as background for your focus sessions.',
    coverArt: 'https://images.unsplash.com/photo-1448375240586-882707db888b',
    audioSrc: '/notification.mp3',
    duration: 187,
    uploadDate: '2024-03-15',
    plays: 1245,
    likes: 328,
    comments: 42
  },
  {
    id: '2',
    title: 'Urban City Nightlife',
    artist: 'CityScapes',
    artistId: 'user2',
    description: 'The ambient sounds of a busy city at night. Traffic, distant conversations, and the subtle energy of urban life.',
    coverArt: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390',
    audioSrc: '/notification.mp3',
    duration: 215,
    uploadDate: '2024-03-02',
    plays: 876,
    likes: 192,
    comments: 28
  }
];

export default function AudioPlayer() {
  const { id } = useParams<{ id: string }>();
  const [track, setTrack] = useState(audioTracks[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  
  useEffect(() => {
    // Find the track based on the ID param
    const foundTrack = audioTracks.find(t => t.id === id);
    if (foundTrack) {
      setTrack(foundTrack);
    }
    
    // Reset player state when track changes
    setIsPlaying(false);
    setCurrentTime(0);
  }, [id]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleSeek = (value: number[]) => {
    setCurrentTime(value[0]);
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

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <div className="min-h-screen pb-16 md:pb-0 md:pl-16">
      <Navbar />
      
      <div className="container max-w-4xl mx-auto p-4">
        <div className="mb-6">
          <Button
            variant="ghost"
            className="gap-2"
            as={Link}
            to="/library"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="bg-gradient-to-r from-purple-800 to-blue-800 rounded-t-lg p-6">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="w-40 h-40 md:w-48 md:h-48 shadow-lg rounded-lg overflow-hidden">
                  <img 
                    src={track.coverArt} 
                    alt={track.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <Badge className="mb-2">Audio</Badge>
                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{track.title}</h1>
                  <Link to={`/profile/${track.artistId}`} className="text-white/90 hover:text-white">
                    {track.artist}
                  </Link>
                  
                  <div className="flex flex-wrap gap-3 mt-4 justify-center md:justify-start text-white/80 text-sm">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {formatTime(track.duration)}
                    </div>
                    <div className="flex items-center">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      {track.comments} comments
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <Card className="p-6">
              <div className="mb-6">
                <AudioWaveform 
                  audioUrl={track.audioSrc}
                  playing={isPlaying}
                  height={80}
                />
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm flex items-center">
                    <span className="text-muted-foreground mr-2">{formatTime(currentTime)}</span>
                    <Slider
                      value={[currentTime]}
                      min={0}
                      max={track.duration}
                      step={0.1}
                      onValueChange={handleSeek}
                      className="w-40 md:w-80"
                    />
                    <span className="text-muted-foreground ml-2">{formatTime(track.duration)}</span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Button variant="ghost" size="icon" onClick={toggleMute}>
                      {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
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
                
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Button
                      variant={isLiked ? "default" : "outline"}
                      className="gap-2"
                      onClick={() => setIsLiked(!isLiked)}
                    >
                      <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
                      {track.likes + (isLiked ? 1 : 0)}
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <Share className="h-4 w-4" />
                      Share
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <SkipBack className="h-5 w-5" />
                    </Button>
                    <Button 
                      size="icon" 
                      className="h-12 w-12 rounded-full"
                      onClick={togglePlay}
                    >
                      {isPlaying ? (
                        <Pause className="h-6 w-6" />
                      ) : (
                        <Play className="h-6 w-6" />
                      )}
                    </Button>
                    <Button variant="ghost" size="icon">
                      <SkipForward className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground">{track.description}</p>
                
                <div className="mt-4 flex items-center text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mr-1" />
                  Uploaded on {formatDate(track.uploadDate)}
                </div>
              </div>
            </Card>
          </div>
          
          <div>
            <Card className="p-4 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Avatar>
                  <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb" />
                  <AvatarFallback>{track.artist[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{track.artist}</h3>
                  <p className="text-xs text-muted-foreground">42 tracks</p>
                </div>
              </div>
              <Button className="w-full">Follow</Button>
            </Card>
            
            <h3 className="font-semibold mb-3">Related Tracks</h3>
            {audioTracks.filter(t => t.id !== id).map(relatedTrack => (
              <Card key={relatedTrack.id} className="mb-3 overflow-hidden">
                <Link to={`/player/${relatedTrack.id}`} className="flex gap-3 p-3">
                  <div className="w-16 h-16 flex-shrink-0 rounded overflow-hidden">
                    <img 
                      src={relatedTrack.coverArt} 
                      alt={relatedTrack.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{relatedTrack.title}</h4>
                    <p className="text-sm text-muted-foreground">{relatedTrack.artist}</p>
                    <div className="flex items-center mt-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatTime(relatedTrack.duration)}
                    </div>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
