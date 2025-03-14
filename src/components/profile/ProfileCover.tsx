
import { Button } from "@/components/ui/button";
import { ImagePlus, Maximize } from "lucide-react";

interface ProfileCoverProps {
  coverUrl: string | null;
  isOwner: boolean;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<string>;
  onOpenFullscreen: () => void;
}

export function ProfileCover({ 
  coverUrl, 
  isOwner, 
  onUpload, 
  onOpenFullscreen 
}: ProfileCoverProps) {
  return (
    <div className="relative h-[300px]">
      <div className="w-full h-full bg-muted flex items-center justify-center">
        {coverUrl ? (
          <div className="relative w-full h-full">
            <img 
              src={coverUrl} 
              alt="Cover" 
              className="w-full h-full object-cover cursor-pointer"
              onClick={onOpenFullscreen}
            />
            <Button
              size="icon"
              variant="ghost"
              className="absolute bottom-4 right-16 bg-black/50 hover:bg-black/70 text-white"
              onClick={onOpenFullscreen}
            >
              <Maximize className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <ImagePlus className="h-12 w-12 text-muted-foreground/50" />
          </div>
        )}
        {isOwner && (
          <div className="absolute bottom-4 right-4">
            <input
              type="file"
              id="cover-upload"
              className="hidden"
              accept="image/*"
              onChange={onUpload}
            />
            <label htmlFor="cover-upload">
              <Button
                size="icon"
                variant="secondary"
                className="cursor-pointer"
                asChild
              >
                <span>
                  <ImagePlus className="h-4 w-4" />
                </span>
              </Button>
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
