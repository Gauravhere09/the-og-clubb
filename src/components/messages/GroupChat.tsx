
import { useState, useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Mic, Square, Image as ImageIcon, X, ArrowLeft, Phone, Video, Search, MoreVertical } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { GroupMessage } from "@/hooks/use-group-messages";
import { uploadProfileImage } from "@/lib/api/profile";

interface GroupChatProps {
  messages: GroupMessage[];
  currentUserId: string;
  onSendMessage: (content: string, type: 'text' | 'audio' | 'image', audioBlob?: Blob) => Promise<void>;
  onClose?: () => void;
}

export const GroupChat = ({ messages, currentUserId, onSendMessage, onClose }: GroupChatProps) => {
  const [newMessage, setNewMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<BlobPart[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        await onSendMessage('', 'audio', audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    await onSendMessage(newMessage, 'text');
    setNewMessage("");
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await onSendMessage(file.name, 'image', file);
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] md:h-[600px]">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#9b87f5] dark:bg-black border border-[#7E69AB] dark:border-neutral-800 flex items-center justify-center">
            <span className="text-sm font-semibold text-white">H</span>
          </div>
          Red H
        </h2>
        {onClose && (
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender_id === currentUserId ? "justify-end" : "justify-start"}`}
            >
              <div className="flex gap-2">
                {message.sender_id !== currentUserId && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={message.sender?.avatar_url || undefined} />
                    <AvatarFallback>{message.sender?.username[0]}</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender_id === currentUserId
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {message.type === 'audio' ? (
                    <audio src={message.media_url || undefined} controls className="max-w-[200px]" />
                  ) : message.media_url ? (
                    <img src={message.media_url} alt="Imagen enviada" className="max-w-[200px] rounded" />
                  ) : (
                    <p>{message.content}</p>
                  )}
                  <div
                    className={`text-xs mt-1 ${
                      message.sender_id === currentUserId 
                        ? "text-primary-foreground/70" 
                        : "text-muted-foreground"
                    }`}
                  >
                    {message.sender?.username} • {new Date(message.created_at).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white"
          >
            <ImageIcon className="h-5 w-5" />
          </Button>
          <Input 
            placeholder="Escribe un mensaje..." 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1"
          />
          {isRecording ? (
            <Button 
              type="button" 
              variant="destructive" 
              size="icon"
              onClick={stopRecording}
            >
              <Square className="h-4 w-4" />
            </Button>
          ) : (
            <Button 
              type="button" 
              variant="secondary" 
              size="icon"
              onClick={startRecording}
            >
              <Mic className="h-4 w-4" />
            </Button>
          )}
          <Button type="submit" size="icon" disabled={!newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};
