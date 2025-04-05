
import { useRef, useEffect } from 'react';

interface AudioWaveformProps {
  audioUrl: string;
  className?: string;
  color?: string;
  height?: number;
  playing?: boolean;
  onReady?: () => void;
}

export function AudioWaveform({
  audioUrl,
  className = "",
  color = "hsl(var(--primary))",
  height = 80,
  playing = false,
  onReady
}: AudioWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const loadedRef = useRef<boolean>(false);

  // Load audio data
  useEffect(() => {
    if (!audioUrl || loadedRef.current) return;
    
    const fetchAudio = async () => {
      try {
        const response = await fetch(audioUrl);
        const arrayBuffer = await response.arrayBuffer();
        
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        
        const audioContext = audioContextRef.current;
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        audioBufferRef.current = audioBuffer;
        
        // Draw initial waveform
        drawWaveform();
        loadedRef.current = true;
        onReady?.();
      } catch (error) {
        console.error("Error loading audio:", error);
      }
    };

    fetchAudio();
    
    return () => {
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [audioUrl, onReady]);

  // Handle playing state
  useEffect(() => {
    if (!audioBufferRef.current || !audioContextRef.current) return;
    
    if (playing) {
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
      }
      
      const audioContext = audioContextRef.current;
      const source = audioContext.createBufferSource();
      source.buffer = audioBufferRef.current;
      
      // Create analyzer for visualizations
      if (!analyserRef.current) {
        analyserRef.current = audioContext.createAnalyser();
        analyserRef.current.fftSize = 256;
      }
      
      source.connect(analyserRef.current);
      analyserRef.current.connect(audioContext.destination);
      
      sourceNodeRef.current = source;
      source.start(0);
      
      animateWaveform();
    } else {
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
        sourceNodeRef.current = null;
      }
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
  }, [playing]);

  const drawWaveform = () => {
    const canvas = canvasRef.current;
    if (!canvas || !audioBufferRef.current) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const audioBuffer = audioBufferRef.current;
    const data = audioBuffer.getChannelData(0);
    const step = Math.ceil(data.length / canvas.width);
    const amp = canvas.height / 2;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = color;
    
    for (let i = 0; i < canvas.width; i++) {
      let min = 1.0;
      let max = -1.0;
      
      for (let j = 0; j < step; j++) {
        const datum = data[(i * step) + j];
        if (datum < min) min = datum;
        if (datum > max) max = datum;
      }
      
      ctx.fillRect(i, (1 + min) * amp, 1, Math.max(1, (max - min) * amp));
    }
  };

  const animateWaveform = () => {
    if (!analyserRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const render = () => {
      animationRef.current = requestAnimationFrame(render);
      
      analyser.getByteFrequencyData(dataArray);
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = color;
      
      const barWidth = canvas.width / bufferLength;
      let x = 0;
      
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        const y = canvas.height - barHeight;
        
        ctx.fillRect(x, y, barWidth, barHeight);
        x += barWidth + 1;
      }
    };
    
    render();
  };

  return (
    <div className={`waveform-container ${className}`} style={{ height: `${height}px` }}>
      <canvas
        ref={canvasRef}
        className="waveform-canvas"
        width={1000}
        height={height}
      />
    </div>
  );
}
