
import { ThumbsUp, Heart, Laugh, Angry, Sigma } from "lucide-react";

export const reactionIcons = {
  like: { icon: ThumbsUp, color: "text-blue-500", label: "Me gusta" },
  love: { icon: Heart, color: "text-red-500", label: "Me encanta" },
  haha: { icon: Laugh, color: "text-yellow-500", label: "Me divierte" },
  angry: { icon: Angry, color: "text-orange-500", label: "Me enoja" },
  surprised: { 
    icon: () => (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
        <circle cx="12" cy="12" r="4" fill="currentColor"/>
        <circle cx="8" cy="9" r="1.5" fill="currentColor"/>
        <circle cx="16" cy="9" r="1.5" fill="currentColor"/>
      </svg>
    ), 
    color: "text-purple-500", 
    label: "Me asombra" 
  },
  sigma: { icon: Sigma, color: "text-gray-700", label: "Sigma" }
} as const;

export type ReactionType = keyof typeof reactionIcons;
