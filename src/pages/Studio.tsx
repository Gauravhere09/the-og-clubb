import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { Music, Upload, Mic, Save, PlayCircle, PauseCircle, Trash2, Headphones } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { useToast } from "@/hooks/use-toast";

export default function Studio() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let recorder: MediaRecorder | null = null;

    const initializeRecorder = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        recorder = new MediaRecorder(stream);

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            setRecordedChunks((prev) => [...prev, event.data]);
          }
        };

        recorder.onstop = () => {
          stream.getTracks().forEach(track => track.stop());
        };

        setMediaRecorder(recorder);
      } catch (error) {
        console.error("Error initializing media recorder:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to initialize audio recording. Please check your microphone permissions."
        });
      }
    };

    initializeRecorder();

    return () => {
      if (recorder && recorder.state === 'recording') {
        recorder.stop();
      }
    };
  }, [toast]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
  };

  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      setAudioUrl(URL.createObjectURL(file));
    }
  };

  const handleStartRecording = () => {
    if (mediaRecorder && mediaRecorder.state === "inactive") {
      setRecordedChunks([]);
      mediaRecorder.start();
      setIsRecording(true);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const handlePlayRecording = () => {
    if (recordedChunks.length > 0) {
      const audioBlob = new Blob(recordedChunks, { type: 'audio/webm' });
      const audioUrl = URL.createObjectURL(audioBlob);

      if (audioElement) {
        audioElement.pause();
      }

      const newAudioElement = new Audio(audioUrl);
      newAudioElement.onended = () => setIsPlaying(false);
      newAudioElement.play();

      setAudioElement(newAudioElement);
      setIsPlaying(true);
    }
  };

  const handlePauseRecording = () => {
    if (audioElement) {
      audioElement.pause();
      setIsPlaying(false);
    }
  };

  const handleDiscardRecording = () => {
    setRecordedChunks([]);
    if (audioElement) {
      audioElement.pause();
      URL.revokeObjectURL(audioElement.src);
      setAudioElement(null);
      setIsPlaying(false);
    }
  };

  const handleSave = () => {
    // Implement save logic here
    console.log("Saving:", { title, description, audioFile, recordedChunks });
    toast({
      title: "Saved",
      description: "Your audio has been saved successfully!",
    });
  };

  return (
    <div className="min-h-screen bg-background flex md:flex-row">
      <Navbar />
      <div className="flex-1 p-4 md:pl-16">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Audio Studio</CardTitle>
            <CardDescription>Create your next audio masterpiece.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={handleTitleChange} placeholder="Song Title" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={handleDescriptionChange}
                placeholder="About this song"
                className="resize-none"
              />
            </div>
            <Tabs defaultValue="upload" className="w-full">
              <TabsList>
                <TabsTrigger value="upload"><Upload className="mr-2 h-4 w-4" /> Upload</TabsTrigger>
                <TabsTrigger value="record"><Mic className="mr-2 h-4 w-4" /> Record</TabsTrigger>
              </TabsList>
              <TabsContent value="upload" className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="audio">Upload Audio File</Label>
                  <Input type="file" id="audio" accept="audio/*" onChange={handleAudioFileChange} />
                  {audioUrl && (
                    <audio controls src={audioUrl} className="mt-4 w-full">
                      Your browser does not support the audio element.
                    </audio>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="record" className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    onClick={isRecording ? handleStopRecording : handleStartRecording}
                    disabled={!mediaRecorder}
                  >
                    {isRecording ? (
                      <>
                        <PauseCircle className="mr-2 h-4 w-4" />
                        Stop Recording
                      </>
                    ) : (
                      <>
                        <Mic className="mr-2 h-4 w-4" />
                        Start Recording
                      </>
                    )}
                  </Button>
                  {recordedChunks.length > 0 && (
                    <>
                      <Button variant="outline" onClick={isPlaying ? handlePauseRecording : handlePlayRecording}>
                        {isPlaying ? (
                          <>
                            <PauseCircle className="mr-2 h-4 w-4" />
                            Pause
                          </>
                        ) : (
                          <>
                            <PlayCircle className="mr-2 h-4 w-4" />
                            Play
                          </>
                        )}
                      </Button>
                      <Button variant="destructive" onClick={handleDiscardRecording}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Discard
                      </Button>
                    </>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter>
            <Button className="bg-green-500 hover:bg-green-700 text-white" onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
