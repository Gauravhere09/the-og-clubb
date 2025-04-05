
import React from "react";
import { JoinIdeaDialog } from "@/components/post/idea/JoinIdeaDialog";

interface JoinIdeaDialogWrapperProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  profession: string;
  setProfession: (profession: string) => void;
  onJoin: () => Promise<void>;
  ideaTitle?: string;
}

export function JoinIdeaDialogWrapper({
  isOpen,
  onOpenChange,
  profession,
  setProfession,
  onJoin,
  ideaTitle
}: JoinIdeaDialogWrapperProps) {
  const handleSubmit = async () => {
    try {
      await onJoin();
    } catch (error) {
      console.error("Error al unirse a la idea:", error);
    }
  };

  return (
    <JoinIdeaDialog 
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      onJoin={handleSubmit}
      ideaTitle={ideaTitle}
    />
  );
}
