
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { AudioRecorder } from "../AudioRecorder";
import { Image, Video, BarChart } from "lucide-react";

interface PostActionButtonsProps {
  onFileSelect: (file: File) => void;
  onPollCreate: () => void;
  isPending: boolean;
}

export function PostActionButtons({ onFileSelect, onPollCreate, isPending }: PostActionButtonsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div className="flex gap-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*,video/*,audio/*"
        className="hidden"
      />
      <Button
        variant="ghost"
        size="icon"
        onClick={() => fileInputRef.current?.click()}
        disabled={isPending}
      >
        <Image className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => fileInputRef.current?.click()}
        disabled={isPending}
      >
        <Video className="h-4 w-4" />
      </Button>
      <AudioRecorder onRecordingComplete={(blob) => onFileSelect(new File([blob], "audio.webm", { type: "audio/webm" }))} />
      <Button
        variant="ghost"
        size="icon"
        onClick={onPollCreate}
        disabled={isPending}
      >
        <BarChart className="h-4 w-4" />
      </Button>
    </div>
  );
}
