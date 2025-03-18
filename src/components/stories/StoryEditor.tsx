
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { VisibilitySelector } from "../post/VisibilitySelector";
import { StoryVisibility } from "./utils/story-utils";
import { ChevronLeft, ChevronRight, Trash2, Upload } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface StoryEditorProps {
  previewUrls: string[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  onRemoveImage: (index: number) => void;
  visibility: StoryVisibility;
  onVisibilityChange: (visibility: StoryVisibility) => void;
  onSubmit: () => void;
  isUploading: boolean;
  userProfile: {
    username: string;
    avatarUrl: string | null;
  };
}

export function StoryEditor({
  previewUrls,
  currentIndex,
  onIndexChange,
  onRemoveImage,
  visibility,
  onVisibilityChange,
  onSubmit,
  isUploading,
  userProfile
}: StoryEditorProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-2 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={userProfile.avatarUrl || undefined} />
            <AvatarFallback>{userProfile.username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{userProfile.username || 'Usuario'}</span>
        </div>
        
        <VisibilitySelector 
          visibility={visibility as 'public' | 'friends' | 'incognito'} 
          onVisibilityChange={(v) => onVisibilityChange(v as StoryVisibility)} 
        />
      </div>
      
      <div className="flex-1 relative bg-black">
        {previewUrls.length > 0 ? (
          <>
            <img 
              src={previewUrls[currentIndex]} 
              alt="Story preview" 
              className="w-full h-full object-contain"
            />
            
            {previewUrls.length > 1 && (
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-black/30 text-white hover:bg-black/50"
                  onClick={() => onIndexChange(Math.max(0, currentIndex - 1))}
                  disabled={currentIndex === 0}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-black/30 text-white hover:bg-black/50"
                  onClick={() => onIndexChange(Math.min(previewUrls.length - 1, currentIndex + 1))}
                  disabled={currentIndex === previewUrls.length - 1}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </div>
            )}
            
            <div className="absolute bottom-4 right-4">
              <Button
                variant="destructive"
                size="icon"
                onClick={() => onRemoveImage(currentIndex)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            
            {previewUrls.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-1">
                {previewUrls.map((_, index) => (
                  <div 
                    key={index}
                    className={`h-1.5 rounded-full transition-all ${
                      index === currentIndex ? 'w-4 bg-primary' : 'w-1.5 bg-white/50'
                    }`}
                    onClick={() => onIndexChange(index)}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-white">
            No hay imágenes seleccionadas
          </div>
        )}
      </div>
      
      <div className="px-4 py-3 flex justify-between border-t border-border">
        <Button variant="outline" onClick={() => onIndexChange(0)}>
          Descartar
        </Button>
        
        <Button 
          onClick={onSubmit} 
          disabled={previewUrls.length === 0 || isUploading}
          className="gap-2"
        >
          <Upload className="h-4 w-4" />
          {isUploading ? 'Subiendo...' : 'Compartir historia'}
        </Button>
      </div>
    </div>
  );
}
