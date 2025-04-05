import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AudioPlayer } from "@/components/ui/audio-player";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Edit,
  Settings,
  Share,
  Play,
  Heart,
  Calendar,
  Music,
  Headphones,
  BarChart3
} from "lucide-react";

// Mock data
const userProfile = {
  name: 'Sarah Johnson',
  username: 'sarahsounds',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
  bio: 'Sound designer and audio enthusiast. Creating immersive audio experiences.',
  stats: {
    followers: 275,
    following: 134,
    tracks: 48
  }
};

const userTracks = [
  {
    id: '1',
    title: 'City Ambience - Night',
    plays: 823,
    likes: 94,
    createdAt: '2024-03-15',
    duration: 312,
    coverArt: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390'
  },
  {
    id: '2',
    title: 'Rainy Day Effects',
    plays: 604,
    likes: 82,
    createdAt: '2024-02-28',
    duration: 245,
    coverArt: 'https://images.unsplash.com/photo-1428592953211-077101b2021b'
  },
  {
    id: '3',
    title: 'Gentle Piano Melody',
    plays: 412,
    likes: 65,
    createdAt: '2024-02-14',
    duration: 184,
    coverArt: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0'
  }
];

// Add the Profile type export
import { Profile as ProfileType } from "@/types/Profile";

// Export the type for other components to use
export type Profile = ProfileType;

export default function Profile() {
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  
  const handlePlay = (id: string) => {
    setCurrentPlayingId(id === currentPlayingId ? null : id);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };
  
  return (
    <div className="min-h-screen pb-16 md:pb-0 md:pl-16">
      <Navbar />
      
      <div className="container max-w-6xl mx-auto p-4">
        <Card className="p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <Avatar className="h-24 w-24 md:h-32 md:w-32">
              <AvatarImage src={userProfile.avatar} />
              <AvatarFallback>{userProfile.name[0]}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-bold">{userProfile.name}</h1>
              <p className="text-muted-foreground">@{userProfile.username}</p>
              
              <p className="my-4">{userProfile.bio}</p>
              
              <div className="flex flex-wrap gap-4 justify-center md:justify-start mb-4">
                <div>
                  <span className="text-lg font-bold">{formatNumber(userProfile.stats.followers)}</span>
                  <p className="text-sm text-muted-foreground">Followers</p>
                </div>
                <div>
                  <span className="text-lg font-bold">{userProfile.stats.following}</span>
                  <p className="text-sm text-muted-foreground">Following</p>
                </div>
                <div>
                  <span className="text-lg font-bold">{userProfile.stats.tracks}</span>
                  <p className="text-sm text-muted-foreground">Tracks</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <Button className="gap-2">
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </Button>
                <Button variant="outline" className="gap-2">
                  <Share className="h-4 w-4" />
                  Share
                </Button>
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
        
        <Tabs defaultValue="tracks" className="mb-8">
          <TabsList>
            <TabsTrigger value="tracks" className="flex items-center gap-2">
              <Music className="h-4 w-4" />
              Tracks
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Stats
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="tracks" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userTracks.map((track) => (
                <Card key={track.id} className="overflow-hidden flex flex-col">
                  <div className="relative h-40">
                    <img 
                      src={track.coverArt} 
                      alt={track.title}
                      className="w-full h-full object-cover"
                    />
                    <Button 
                      className="absolute bottom-2 right-2" 
                      size="sm"
                      onClick={() => handlePlay(track.id)}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      {track.id === currentPlayingId ? 'Pause' : 'Play'}
                    </Button>
                  </div>
                  
                  <div className="p-4 flex-1 flex flex-col">
                    <div>
                      <h3 className="font-medium mb-1">{track.title}</h3>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>{formatDate(track.createdAt)}</span>
                        <span className="mx-1">•</span>
                        <span>{formatDuration(track.duration)}</span>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex gap-3">
                        <div className="flex items-center text-muted-foreground text-sm">
                          <Headphones className="h-4 w-4 mr-1" />
                          {formatNumber(track.plays)}
                        </div>
                        <div className="flex items-center text-muted-foreground text-sm">
                          <Heart className="h-4 w-4 mr-1" />
                          {track.likes}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Share className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {currentPlayingId === track.id && (
                      <div className="mt-3">
                        <AudioPlayer 
                          src="/notification.mp3" 
                          title={track.title}
                          showWaveform={false}
                        />
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="stats" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-medium mb-4">Listening Activity</h3>
                <div className="h-64 flex items-center justify-center bg-muted/30 rounded-md">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">
                      Track listening analytics visualization would appear here
                    </p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6">
                <h3 className="text-lg font-medium mb-4">Popular Recordings</h3>
                
                <div className="space-y-4">
                  {userTracks.map((track, index) => (
                    <div key={track.id} className="flex items-center gap-3">
                      <div className="font-bold text-muted-foreground w-5">{index + 1}</div>
                      <div className="h-12 w-12 rounded overflow-hidden flex-shrink-0">
                        <img 
                          src={track.coverArt} 
                          alt={track.title} 
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{track.title}</p>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Headphones className="h-3 w-3 mr-1" />
                          {formatNumber(track.plays)} plays
                        </div>
                      </div>
                      <Badge variant="outline">
                        {formatDuration(track.duration)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
