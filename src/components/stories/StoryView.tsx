
import React, { useEffect, useState } from "react";
import { StoryProgress } from "./StoryProgress";
import { StoryHeader } from "./StoryHeader";
import { StoryContent } from "./StoryContent";
import { StoryActions } from "./StoryActions";
import { useStory } from "@/hooks/use-story";
import { StoryComments } from "./StoryComments";

export function StoryView() {
  const { storyData, isLoading, timeDisplay, error } = useStory();
  const [showComments, setShowComments] = useState(false);

  const toggleComments = () => {
    setShowComments(!showComments);
  };

  // If there's an error, handle it
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black">
        <div className="text-white text-lg">No se pudo cargar la historia</div>
        <button 
          className="mt-4 px-6 py-2 rounded-full bg-blue-500 text-white"
          onClick={() => window.history.back()}
        >
          Volver
        </button>
      </div>
    );
  }

  if (isLoading || !storyData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black">
        <div className="w-10 h-10 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col h-screen bg-black">
      <StoryProgress />
      <StoryHeader 
        username={storyData.user.username} 
        avatarUrl={storyData.user.avatarUrl} 
        timeDisplay={timeDisplay}
      />
      
      <StoryContent />

      {showComments ? (
        <StoryComments onClose={toggleComments} />
      ) : (
        <StoryActions onCommentClick={toggleComments} />
      )}
    </div>
  );
}
