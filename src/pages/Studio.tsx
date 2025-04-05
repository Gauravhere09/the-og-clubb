
import { useState, useRef } from "react";
import { Navbar } from "@/components/navbar";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AudioRecorder } from "@/components/audio-recorder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AudioPlayer } from "@/components/ui/audio-player";
import { useToast } from "@/hooks/use-toast";
import { 
  Mic, 
  Upload, 
  Save, 
  Waveform,
  Trash,
  Share
} from "lucide-react";

export default function Studio() {
  const [tab, setTab] = useState("record");
  const [recordedAudio, setRecordedAudio] = useState<{
    blob: Blob;
    url: string;
    duration: number;
  } | null>(null);
  const [uploadedAudio, setUploadedAudio] = useState<{
    file: File;
    url: string;
  } | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleRecordingComplete = (blob: Blob, duration: number) => {
    const url = URL.createObjectURL(blob);
    setRecordedAudio({ blob, url, duration });
    // Set a default title based on date/time
    setTitle(`Recording - ${new Date().toLocaleString()}`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('audio/')) {
      toast({
        variant: "destructive",
        title: "Invalid File",
        description: "Please upload an audio file"
      });
      return;
    }
    
    const url = URL.createObjectURL(file);
    setUploadedAudio({ file, url });
    // Set a default title based on filename
    setTitle(file.name.replace(/\.[^/.]+$/, ""));
  };

  const handleSave = async () => {
    if (!title) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please provide a title for your audio"
      });
      return;
    }
    
    const audioData = tab === "record" ? recordedAudio : uploadedAudio;
    if (!audioData) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No audio content to save"
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Here you would implement the actual saving logic
      // For now, just simulate a delay and success
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Audio Saved",
        description: "Your audio has been saved successfully"
      });
      
      // Reset form after successful save
      setRecordedAudio(null);
      setUploadedAudio(null);
      setTitle("");
      setDescription("");
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save audio"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    if (tab === "record") {
      if (recordedAudio?.url) {
        URL.revokeObjectURL(recordedAudio.url);
      }
      setRecordedAudio(null);
    } else {
      if (uploadedAudio?.url) {
        URL.revokeObjectURL(uploadedAudio.url);
      }
      setUploadedAudio(null);
    }
    setTitle("");
    setDescription("");
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="min-h-screen pb-16 md:pb-0 md:pl-16">
      <Navbar />
      
      <div className="container max-w-4xl mx-auto p-4">
        <header className="py-6">
          <h1 className="text-3xl font-bold">Studio</h1>
          <p className="text-muted-foreground">Create and manage your audio content</p>
        </header>
        
        <Tabs value={tab} onValueChange={setTab} className="space-y-6">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="record" className="flex items-center gap-2">
              <Mic className="h-4 w-4" />
              Record
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="record" className="space-y-6">
            {!recordedAudio ? (
              <AudioRecorder 
                onRecordingComplete={handleRecordingComplete}
                maxDuration={300} // 5 minutes
              />
            ) : (
              <Card className="p-4">
                <div className="mb-4">
                  <h3 className="font-medium mb-2">Preview Recording</h3>
                  <AudioPlayer 
                    src={recordedAudio.url}
                    title={title || "New Recording"}
                  />
                  <div className="text-sm text-muted-foreground mt-2">
                    Duration: {formatDuration(recordedAudio.duration)}
                  </div>
                </div>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="upload" className="space-y-6">
            {!uploadedAudio ? (
              <Card className="p-6 flex flex-col items-center justify-center text-center">
                <Waveform className="h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Upload Audio File</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Supported formats: MP3, WAV, AAC, M4A
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="audio/*"
                  className="hidden"
                />
                <Button onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File
                </Button>
              </Card>
            ) : (
              <Card className="p-4">
                <div className="mb-4">
                  <h3 className="font-medium mb-2">Preview Audio</h3>
                  <AudioPlayer 
                    src={uploadedAudio.url}
                    title={title || uploadedAudio.file.name}
                  />
                  <div className="text-sm text-muted-foreground mt-2">
                    File: {uploadedAudio.file.name}
                  </div>
                </div>
              </Card>
            )}
          </TabsContent>
        </Tabs>
        
        {(recordedAudio || uploadedAudio) && (
          <div className="mt-6 space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Audio Details</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium mb-1">
                    Title
                  </label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Give your audio a title"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium mb-1">
                    Description
                  </label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add a description (optional)"
                    rows={3}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="isPublic" className="text-sm font-medium">
                    Make this audio public
                  </label>
                </div>
              </div>
            </Card>
            
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handleDiscard}
                className="gap-2"
              >
                <Trash className="h-4 w-4" />
                Discard
              </Button>
              
              <div className="space-x-2">
                <Button
                  variant="secondary"
                  className="gap-2"
                >
                  <Share className="h-4 w-4" />
                  Share
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving || !title}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
