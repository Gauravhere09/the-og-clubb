
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface JoinIdeaDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onJoin: (profession: string) => void;
  ideaTitle?: string;
}

export function JoinIdeaDialog({ 
  isOpen, 
  onOpenChange, 
  onJoin, 
  ideaTitle 
}: JoinIdeaDialogProps) {
  const [profession, setProfession] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!profession.trim()) return;
    
    setIsLoading(true);
    try {
      await onJoin(profession);
      setProfession(""); // Reset the input after successful join
    } catch (error) {
      console.error("Error joining the idea:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Join this idea</DialogTitle>
        </DialogHeader>
        
        {ideaTitle && (
          <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-md text-sm mb-4">
            <p className="font-medium mb-1">Idea: {ideaTitle}</p>
            <p className="text-muted-foreground">You are about to join this initiative.</p>
          </div>
        )}
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="profession">What is your profession or skill?</Label>
            <Input
              id="profession"
              placeholder="E.g.: Web Developer, UX/UI Designer, Marketing..."
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Help other participants understand what you can contribute to the idea.
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!profession.trim() || isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? "Joining..." : "Join this idea"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
