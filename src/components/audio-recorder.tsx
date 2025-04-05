
import { useState, useRef, useEffect } from "react";
import { Mic, Square, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob, duration: number) => void;
  className?: string;
  maxDuration?: number;
}

export function AudioRecorder({ 
  onRecordingComplete, 
  className = "", 
  maxDuration = 300 
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunks = useRef<BlobPart[]>([]);
  const { toast } = useToast();
  
  // Cleanup function
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      if (MediaRecorder.isTypeSupported('audio/webm')) {
        mediaRecorder.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      } else {
        mediaRecorder.current = new MediaRecorder(stream);
      }
      
      audioChunks.current = [];
      
      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunks.current.push(e.data);
        }
      };
      
      mediaRecorder.current.onstart = () => {
        setIsRecording(true);
        setIsPaused(false);
        setTimeElapsed(0);
        
        if (audioUrl) {
          URL.revokeObjectURL(audioUrl);
          setAudioUrl(null);
          setAudioBlob(null);
        }
        
        timerRef.current = setInterval(() => {
          setTimeElapsed(prev => {
            if (prev >= maxDuration) {
              stopRecording();
              return maxDuration;
            }
            return prev + 1;
          });
        }, 1000);
      };
      
      mediaRecorder.current.onstop = () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        
        const blob = new Blob(audioChunks.current, { 
          type: mediaRecorder.current?.mimeType || 'audio/webm' 
        });
        
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        
        stream.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        
        setIsRecording(false);
        setIsPaused(false);
      };
      
      mediaRecorder.current.start();
    } catch (err) {
      console.error("Error accessing microphone:", err);
      toast({
        variant: "destructive",
        title: "Microphone Access Error",
        description: "Could not access your microphone. Please check permissions.",
      });
    }
  };

  const pauseRecording = () => {
    if (mediaRecorder.current && isRecording && !isPaused) {
      mediaRecorder.current.pause();
      setIsPaused(true);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorder.current && isRecording && isPaused) {
      mediaRecorder.current.resume();
      setIsPaused(false);
      
      timerRef.current = setInterval(() => {
        setTimeElapsed(prev => {
          if (prev >= maxDuration) {
            stopRecording();
            return maxDuration;
          }
          return prev + 1;
        });
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && (isRecording || isPaused)) {
      mediaRecorder.current.stop();
    }
  };

  const saveRecording = () => {
    if (audioBlob) {
      onRecordingComplete(audioBlob, timeElapsed);
      
      // Clear the current recording after saving
      setAudioBlob(null);
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
      }
      
      toast({
        title: "Recording Saved",
        description: "Your audio has been saved successfully."
      });
    }
  };

  const discardRecording = () => {
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setTimeElapsed(0);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Audio Recorder</h3>
          <div className="text-sm font-medium">
            {formatTime(timeElapsed)} / {formatTime(maxDuration)}
          </div>
        </div>
        
        <Progress value={(timeElapsed / maxDuration) * 100} className="h-2" />
        
        {audioUrl && (
          <audio src={audioUrl} controls className="w-full mt-2" />
        )}
        
        <div className="flex items-center justify-center gap-4">
          {!isRecording && !audioBlob && (
            <Button
              onClick={startRecording}
              variant="default"
              className="gap-2"
            >
              <Mic className="h-4 w-4" />
              Start Recording
            </Button>
          )}
          
          {isRecording && !isPaused && (
            <>
              <div className="audio-wave">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    style={{ animationDelay: `${i * 0.1}s` }}
                    className="h-full"
                  />
                ))}
              </div>
              
              <Button
                onClick={pauseRecording}
                variant="outline"
              >
                Pause
              </Button>
              
              <Button
                onClick={stopRecording}
                variant="destructive"
                size="icon"
              >
                <Square className="h-4 w-4" />
              </Button>
            </>
          )}
          
          {isRecording && isPaused && (
            <>
              <Button
                onClick={resumeRecording}
                variant="outline"
              >
                Resume
              </Button>
              
              <Button
                onClick={stopRecording}
                variant="destructive"
                size="icon"
              >
                <Square className="h-4 w-4" />
              </Button>
            </>
          )}
          
          {audioBlob && (
            <div className="flex gap-2">
              <Button
                onClick={saveRecording}
                variant="default"
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                Save Recording
              </Button>
              
              <Button
                onClick={discardRecording}
                variant="outline"
              >
                Discard
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
