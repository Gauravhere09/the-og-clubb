
import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AudioPlayer } from "@/components/ui/audio-player";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Play,
  Download,
  Share,
  MoreHorizontal,
  Trash,
  Edit,
  Clock,
  ListMusic,
  Heart,
  BookMarked,
} from "lucide-react";

// Mock data
const myRecordings = [
  {
    id: '1',
    title: 'Interview Session',
    description: 'Recording of the interview with John',
    duration: 845,
    date: '2024-04-02',
    plays: 12,
    favorite: false,
    coverArt: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618'
  },
  {
    id: '2',
    title: 'Voice Notes - Project Ideas',
    description: 'Brainstorming session for new projects',
    duration: 323,
    date: '2024-03-28',
    plays: 5,
    favorite: true,
    coverArt: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76'
  },
  {
    id: '3',
    title: 'Guitar Practice - Blues Scale',
    description: 'Practice session for blues improvisation',
    duration: 562,
    date: '2024-03-25',
    plays: 8,
    favorite: false,
    coverArt: 'https://images.unsplash.com/photo-1525201548942-d8732f6617a0'
  },
  {
    id: '4',
    title: 'Meeting Recording - Marketing Team',
    description: 'Weekly sync with the marketing department',
    duration: 1245,
    date: '2024-03-20',
    plays: 3,
    favorite: false,
    coverArt: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df'
  }
];

const favorites = myRecordings.filter(item => item.favorite);

export default function Library() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTab, setCurrentTab] = useState("all");
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  const [filteredItems, setFilteredItems] = useState(myRecordings);

  useEffect(() => {
    // Filter based on tab and search query
    let items = currentTab === "all" ? myRecordings : favorites;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item => 
        item.title.toLowerCase().includes(query) || 
        item.description.toLowerCase().includes(query)
      );
    }
    
    setFilteredItems(items);
  }, [searchQuery, currentTab]);

  const formatDuration = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hrs > 0) {
      return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    
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
      
      <div className="container max-w-6xl mx-auto p-4">
        <header className="py-6">
          <h1 className="text-3xl font-bold">My Library</h1>
          <p className="text-muted-foreground">Access and manage your audio recordings</p>
        </header>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search recordings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full md:w-auto">
            <TabsList>
              <TabsTrigger value="all" className="flex items-center gap-2">
                <ListMusic className="h-4 w-4" />
                <span className="hidden sm:inline">All Recordings</span>
                <span className="sm:hidden">All</span>
              </TabsTrigger>
              <TabsTrigger value="favorites" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                <span className="hidden sm:inline">Favorites</span>
                <span className="sm:hidden">Favorites</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="space-y-4">
          {filteredItems.length === 0 ? (
            <Card className="p-8 text-center">
              <BookMarked className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">No recordings found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery 
                  ? "Try adjusting your search terms"
                  : currentTab === "favorites" 
                    ? "You haven't favorited any recordings yet"
                    : "You haven't created any recordings yet"
                }
              </p>
              {!searchQuery && currentTab === "all" && (
                <Button>Create New Recording</Button>
              )}
            </Card>
          ) : (
            <TabsContent value={currentTab} className="space-y-4 mt-0">
              {filteredItems.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <div className="md:flex">
                    <div className="md:w-48 h-48 md:h-auto relative">
                      <img 
                        src={item.coverArt} 
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <Badge className="absolute top-2 right-2 bg-background/70">
                        {formatDuration(item.duration)}
                      </Badge>
                    </div>
                    <div className="flex-1 p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold mb-1">{item.title}</h3>
                          <p className="text-muted-foreground text-sm mb-2">
                            {item.description}
                          </p>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{formatDate(item.date)}</span>
                            <span className="mx-2">•</span>
                            <span>{item.plays} plays</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-1">
                          {item.favorite && (
                            <Badge variant="secondary" className="gap-1">
                              <Heart className="h-3 w-3 fill-current" />
                              Favorite
                            </Badge>
                          )}
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center mt-4 gap-2 flex-wrap">
                        <Button 
                          variant="default"
                          size="sm"
                          className="gap-1"
                          onClick={() => setCurrentPlayingId(
                            item.id === currentPlayingId ? null : item.id
                          )}
                        >
                          <Play className="h-3 w-3" />
                          {item.id === currentPlayingId ? "Pause" : "Play"}
                        </Button>
                        
                        <Button variant="secondary" size="sm" className="gap-1">
                          <Download className="h-3 w-3" />
                          Download
                        </Button>
                        
                        <Button variant="outline" size="sm" className="gap-1">
                          <Share className="h-3 w-3" />
                          Share
                        </Button>
                        
                        <Button variant="outline" size="sm" className="gap-1">
                          <Edit className="h-3 w-3" />
                          Edit
                        </Button>
                        
                        <Button variant="outline" size="sm" className="gap-1 text-destructive">
                          <Trash className="h-3 w-3" />
                          Delete
                        </Button>
                      </div>
                      
                      {currentPlayingId === item.id && (
                        <div className="mt-4">
                          <AudioPlayer 
                            src="/notification.mp3"
                            title={item.title}
                            showWaveform={false}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>
          )}
        </div>
      </div>
    </div>
  );
}
