
import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AudioPlayer } from "@/components/ui/audio-player";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Headphones, 
  Clock, 
  BarChart3, 
  Plus,
  TrendingUp
} from "lucide-react";
import { Link } from "react-router-dom";

// Simulated audio tracks for demonstration
const recentTracks = [
  {
    id: '1',
    title: 'Guitar Melody',
    artist: 'Yourself',
    duration: 124,
    coverArt: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d',
    plays: 42,
    createdAt: '2024-04-01'
  },
  {
    id: '2',
    title: 'Piano Session',
    artist: 'Yourself',
    duration: 187,
    coverArt: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0',
    plays: 28,
    createdAt: '2024-03-28'
  },
  {
    id: '3',
    title: 'Ambient Sounds',
    artist: 'Yourself',
    duration: 210,
    coverArt: 'https://images.unsplash.com/photo-1614149162883-504ce4d13909',
    plays: 35,
    createdAt: '2024-03-25'
  }
];

const trendingTracks = [
  {
    id: '4',
    title: 'Midnight Jazz',
    artist: 'JazzMaster',
    duration: 322,
    coverArt: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f',
    plays: 2453
  },
  {
    id: '5',
    title: 'Electronic Dreams',
    artist: 'SynthWave',
    duration: 198,
    coverArt: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745',
    plays: 1879
  },
  {
    id: '6',
    title: 'Acoustic Session',
    artist: 'GuitarHero',
    duration: 267,
    coverArt: 'https://images.unsplash.com/photo-1511735111819-9a3f7709049c',
    plays: 1564
  }
];

export default function Dashboard() {
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="min-h-screen pb-16 md:pb-0 md:pl-16">
      <Navbar />
      
      <div className="container max-w-6xl mx-auto p-4">
        <header className="py-6">
          <h1 className="text-3xl font-bold">Welcome back!</h1>
          <p className="text-muted-foreground">Here's what's happening with your audio content</p>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <DashboardCard 
            title="Total Recordings"
            value="12"
            icon={<Headphones className="h-5 w-5" />}
            trend="+3 this week"
            trendUp={true}
          />
          <DashboardCard 
            title="Total Listening Time"
            value="2.4hrs"
            icon={<Clock className="h-5 w-5" />}
            trend="+0.5hrs this week"
            trendUp={true}
          />
          <DashboardCard 
            title="Total Plays"
            value="156"
            icon={<BarChart3 className="h-5 w-5" />}
            trend="+24 this week"
            trendUp={true}
          />
        </div>
        
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Recordings</h2>
            <Button variant="outline" size="sm">
              <Link to="/library" className="flex items-center gap-2">
                View All
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentTracks.map((track) => (
              <Card key={track.id} className="overflow-hidden">
                <div className="relative h-40">
                  <img 
                    src={track.coverArt} 
                    alt={track.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30" />
                  <Button 
                    variant="secondary"
                    size="icon"
                    className="absolute right-2 top-2"
                    onClick={() => setCurrentPlayingId(track.id === currentPlayingId ? null : track.id)}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                  <div className="absolute bottom-2 left-2">
                    <Badge>{formatTime(track.duration)}</Badge>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium mb-1">{track.title}</h3>
                      <p className="text-sm text-muted-foreground">{track.plays} plays</p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(track.createdAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                  </div>
                  
                  {currentPlayingId === track.id && (
                    <div className="mt-3">
                      <AudioPlayer 
                        src="/notification.mp3" 
                        title={track.title}
                        artist={track.artist}
                        showWaveform={false}
                      />
                    </div>
                  )}
                </div>
              </Card>
            ))}
            
            <Card className="overflow-hidden flex items-center justify-center h-64 border-dashed">
              <Link to="/studio" className="flex flex-col items-center text-center p-6">
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium">Create New Recording</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Record or upload new audio content
                </p>
              </Link>
            </Card>
          </div>
        </section>
        
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">Trending Now</h2>
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <Button variant="outline" size="sm">
              <Link to="/explore" className="flex items-center gap-2">
                Explore More
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {trendingTracks.map((track) => (
              <Card key={track.id} className="flex overflow-hidden h-24">
                <div className="w-24 relative">
                  <img 
                    src={track.coverArt} 
                    alt={track.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 flex items-center justify-between p-3">
                  <div>
                    <h3 className="font-medium text-sm">{track.title}</h3>
                    <p className="text-xs text-muted-foreground">{track.artist}</p>
                    <div className="text-xs mt-1">{formatTime(track.duration)}</div>
                  </div>
                  <div className="flex flex-col items-end">
                    <Button variant="ghost" size="icon" className="h-8 w-8 mb-1">
                      <Play className="h-4 w-4" />
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      {track.plays.toLocaleString()} plays
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

interface DashboardCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: string;
  trendUp: boolean;
}

function DashboardCard({ title, value, icon, trend, trendUp }: DashboardCardProps) {
  return (
    <Card className="p-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-muted-foreground text-sm">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
        </div>
        <div className="p-2 bg-primary/10 rounded-full">
          {icon}
        </div>
      </div>
      <div className={`flex items-center mt-4 text-xs ${trendUp ? 'text-green-500' : 'text-red-500'}`}>
        {trendUp ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingUp className="h-3 w-3 mr-1 transform rotate-180" />}
        <span>{trend}</span>
      </div>
    </Card>
  );
}
