
import { Button } from "@/components/ui/button";
import { Edit2, Heart, MessageCircle } from "lucide-react";
import { FollowButton } from "@/components/FollowButton";

interface ProfileActionsProps {
  isOwner: boolean;
  profileId: string;
  hasGivenHeart: boolean;
  heartLoading: boolean;
  currentUserId: string | null;
  onEditClick: () => void;
  onMessageClick: () => void;
  onToggleHeart: () => void;
}

export function ProfileActions({
  isOwner,
  profileId,
  hasGivenHeart,
  heartLoading,
  currentUserId,
  onEditClick,
  onMessageClick,
  onToggleHeart
}: ProfileActionsProps) {
  if (isOwner) {
    return (
      <Button variant="outline" onClick={onEditClick}>
        <Edit2 className="h-4 w-4 mr-2" />
        Editar perfil
      </Button>
    );
  }

  return (
    <div className="flex gap-2">
      <FollowButton targetUserId={profileId} />
      <Button 
        variant="outline" 
        onClick={onToggleHeart}
        disabled={heartLoading || !currentUserId}
        className={hasGivenHeart ? 'border-red-500 dark:border-red-400 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20' : ''}
      >
        <Heart className={`h-4 w-4 mr-2 ${hasGivenHeart ? 'fill-red-500 dark:fill-red-400' : ''}`} />
        {hasGivenHeart ? 'Quitar corazón' : 'Dar corazón'}
      </Button>
      <Button variant="outline" onClick={onMessageClick}>
        <MessageCircle className="h-4 w-4 mr-2" />
        Mensaje
      </Button>
    </div>
  );
}
