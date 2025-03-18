
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<BlobPart[]>([]);
  const timerRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];
      setRecordingDuration(0);

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      // Start a timer to track recording duration
      timerRef.current = window.setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

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
      // Stop the timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // Stop all audio tracks
      if (streamRef.current) {
        streamRef.current.getAudioTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

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
    recordingDuration,
    startRecording,
    stopRecording
  };
}
