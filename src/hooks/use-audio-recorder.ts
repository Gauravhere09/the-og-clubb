
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<BlobPart[]>([]);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      
      return stream;
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo iniciar la grabación",
      });
      return null;
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
      
      // Return a promise that resolves with the audio blob
      return new Promise<Blob>((resolve) => {
        mediaRecorder.current!.onstop = () => {
          const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
          resolve(audioBlob);
        };
      });
    }
    return Promise.resolve(null);
  };

  return {
    isRecording,
    startRecording,
    stopRecording
  };
}
