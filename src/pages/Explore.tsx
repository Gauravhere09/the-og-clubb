
import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AudioPlayer } from "@/components/ui/audio-player";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AudioWaveform } from "@/components/ui/audio-waveform";
import {
  Search,
  Headphones,
  Music2,
  Radio,
  Mic,
  TrendingUp,
  Heart,
  Play,
  Bookmark,
  UserPlus,
  Share,
} from "lucide-react";

// Mock data
const trendingTracks = [
  {
    id: '1',
    title: 'Deep Focus Music Mix',
    creator: {
      name: 'FocusWaves',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330'
    },
    coverArt: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745',
    plays: 12483,
    likes: 1287,
    duration: 3720
  },
  {
    id: '2',
    title: 'Morning Meditation Session',
    creator: {
      name: 'MindfulMoments',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d'
    },
    coverArt: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773',
    plays: 8754,
    likes: 932,
    duration: 1200
  },
  {
    id: '3',
    title: 'Jazz Piano Improv',
    creator: {
      name: 'JazzMaster',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e'
    },
    coverArt: 'https://images.unsplash.com/photo-1511735111819-9a3f7709049c',
    plays: 6542,
    likes: 785,
    duration: 843
  },
];

const featuredCreators = [
  {
    id: '1',
    name: 'AudioWizard',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6',
    bio: 'Creating immersive soundscapes and ambient music',
    followers: 14325,
    tracks: 48
  },
  {
    id: '2',
    name: 'VoiceProdigy',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9',
    bio: 'Voice actor and narrator specializing in audiobooks',
    followers: 9874,
    tracks: 120
  },
  {
    id: '3',
    name: 'SoundExplorer',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
    bio: 'Field recordings from around the world',
    followers: 7632,
    tracks: 86
  },
];

const categories = [
  { id: '1', name: 'Music', icon: <Music2 /> },
  { id: '2', name: 'Podcasts', icon: <Radio /> },
  { id: '3', name: 'ASMR', icon: <Headphones /> },
  { id: '4', name: 'Interviews', icon: <Mic /> }
];

export default function Explore() {
  const [activeTab, setActiveTab] = useState('trending');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };
  
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const hrs = Math.floor(mins / 60);
    
    if (hrs > 0) {
      const remainingMins = mins % 60;
      return `${hrs}:${remainingMins < 10 ? '0' : ''}${remainingMins}:00`;
    }
    
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  const handlePlay = (id: string) => {
    setCurrentPlayingId(id === currentPlayingId ? null : id);
  };
  
  return (
    <div className="min-h-screen pb-16 md:pb-0 md:pl-16">
      <Navbar />
      
      <div className="container max-w-6xl mx-auto p-4">
        <header className="py-6">
          <h1 className="text-3xl font-bold">Explore</h1>
          <p className="text-muted-foreground">Discover new audio content and creators</p>
        </header>
        
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search for tracks, creators, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 py-6 text-lg"
            />
          </div>
        </div>
        
        <div className="flex overflow-x-auto gap-4 pb-4 mb-8 scrollbar-none">
          {categories.map(category => (
            <Button
              key={category.id}
              variant="outline"
              className="flex items-center gap-2 rounded-full px-6"
            >
              {React.cloneElement(category.icon as React.ReactElement, { className: "h-4 w-4" })}
              {category.name}
            </Button>
          ))}
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="mb-6">
            <TabsTrigger value="trending" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Trending
            </TabsTrigger>
            <TabsTrigger value="creators" className="flex items-center gap-2">
              <Mic className="h-4 w-4" />
              Featured Creators
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="trending" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {trendingTracks.map(track => (
                <Card key={track.id} className="overflow-hidden">
                  <div className="relative h-48">
                    <img 
                      src={track.coverArt} 
                      alt={track.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4">
                      <h3 className="text-xl font-bold text-white">{track.title}</h3>
                      <div className="flex items-center text-white/80 text-sm mt-1">
                        <Avatar className="h-6 w-6 mr-2">
                          <AvatarImage src={track.creator.avatar} />
                          <AvatarFallback>{track.creator.name[0]}</AvatarFallback>
                        </Avatar>
                        {track.creator.name}
                      </div>
                    </div>
                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                      <Badge variant="secondary" className="flex gap-1 items-center">
                        <Headphones className="h-3 w-3" />
                        {formatNumber(track.plays)}
                      </Badge>
                      <Badge variant="secondary" className="flex gap-1 items-center">
                        <Heart className="h-3 w-3" />
                        {formatNumber(track.likes)}
                      </Badge>
                    </div>
                    <Button 
                      className="absolute bottom-4 right-4" 
                      size="sm"
                      onClick={() => handlePlay(track.id)}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      {track.id === currentPlayingId ? 'Pause' : 'Play'}
                    </Button>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-sm text-muted-foreground">
                        Duration: {formatDuration(track.duration)}
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Heart className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Bookmark className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Share className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {currentPlayingId === track.id && (
                      <AudioPlayer 
                        src="/notification.mp3" 
                        title={track.title}
                        artist={track.creator.name}
                      />
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="creators" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCreators.map(creator => (
                <Card key={creator.id} className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <Avatar className="h-24 w-24 mb-4">
                      <AvatarImage src={creator.avatar} />
                      <AvatarFallback>{creator.name[0]}</AvatarFallback>
                    </Avatar>
                    <h3 className="text-xl font-bold mb-1">{creator.name}</h3>
                    <p className="text-muted-foreground mb-3">
                      {creator.bio}
                    </p>
                    <div className="flex gap-4 text-sm text-muted-foreground mb-4">
                      <div>{formatNumber(creator.followers)} followers</div>
                      <div>{creator.tracks} tracks</div>
                    </div>
                    <Button className="w-full">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Follow
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
        
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">Featured Audio</h2>
          <Card className="overflow-hidden">
            <div className="grid md:grid-cols-2">
              <div className="p-6">
                <Badge className="mb-2">Featured</Badge>
                <h3 className="text-2xl font-bold mb-2">
                  Ambient Sound Collection
                </h3>
                <p className="text-muted-foreground mb-4">
                  Immerse yourself in this collection of ambient sounds perfect for relaxation,
                  meditation, and focus. Created by award-winning sound designer AudioPhil.
                </p>
                <div className="mb-4">
                  <AudioWaveform 
                    audioUrl="/notification.mp3"
                    playing={false}
                    height={60}
                  />
                </div>
                <Button className="w-full">
                  <Play className="h-4 w-4 mr-2" />
                  Listen Now
                </Button>
              </div>
              <div className="h-64 md:h-auto">
                <img 
                  src="https://images.unsplash.com/photo-1465225314224-587cd83d322b" 
                  alt="Ambient Sound Collection"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
