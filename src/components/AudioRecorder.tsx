
import { useState, useRef } from "react";
import { Mic, Square, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function AudioRecorder({ onRecordingComplete }: { onRecordingComplete: (blob: Blob) => void }) {
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      mediaRecorder.current.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.current.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        onRecordingComplete(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      setTimeLeft(30);

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            stopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo acceder al micrófono",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  return (
    <div className="flex items-center gap-4">
      {isRecording ? (
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
          <span className="text-sm font-medium">{timeLeft}s</span>
          <Button
            variant="destructive"
            size="icon"
            onClick={stopRecording}
          >
            <Square className="h-4 w-4" />
          </Button>
        </>
      ) : (
        <Button
          variant="secondary"
          size="icon"
          onClick={startRecording}
        >
          <Mic className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
