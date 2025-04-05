import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

interface AudioData {
  id: string;
  title: string;
  artist: string;
  url: string;
  coverUrl: string;
}

const audioList: AudioData[] = [
  {
    id: "1",
    title: "Song 1",
    artist: "Artist 1",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    coverUrl: "https://via.placeholder.com/150",
  },
  {
    id: "2",
    title: "Song 2",
    artist: "Artist 2",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    coverUrl: "https://via.placeholder.com/150",
  },
  {
    id: "3",
    title: "Song 3",
    artist: "Artist 3",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    coverUrl: "https://via.placeholder.com/150",
  },
];

export default function AudioPlayer() {
  const { id } = useParams<{ id: string }>();
  const [audio, setAudio] = useState<AudioData | undefined>(undefined);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (id) {
      const selectedAudio = audioList.find((audio) => audio.id === id);
      setAudio(selectedAudio);
    }
  }, [id]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, audio]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  if (!audio) {
    return <div>Audio not found</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Audio cover */}
      <img
        src={audio.coverUrl}
        alt={audio.title}
        className="w-64 h-64 rounded-md shadow-md mb-6"
      />

      {/* Audio title and artist */}
      <h1 className="text-2xl font-bold mb-2">{audio.title}</h1>
      <h2 className="text-lg text-muted-foreground mb-4">{audio.artist}</h2>

      {/* Audio controls */}
      <audio ref={audioRef} src={audio.url} preload="metadata" />
      <Button onClick={togglePlay} className="bg-primary text-white">
        {isPlaying ? "Pause" : "Play"}
      </Button>

      {/* Back button */}
      <Button variant="ghost" className="absolute top-4 left-4" asChild>
        <Link to="/" className="flex items-center gap-2">
          <Home className="h-4 w-4" />
          Back to Home
        </Link>
      </Button>
    </div>
  );
}
