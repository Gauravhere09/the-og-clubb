
import { Heart } from "lucide-react";

interface ProfileStatsProps {
  followersCount: number;
  heartsCount: number;
  hasGivenHeart: boolean;
}

export function ProfileStats({ 
  followersCount, 
  heartsCount, 
  hasGivenHeart 
}: ProfileStatsProps) {
  return (
    <div className="flex items-center gap-3">
      <p className="text-muted-foreground" title="Número de seguidores">
        {followersCount} seguidores
      </p>
      <div className="flex items-center text-red-500 dark:text-red-400" title="Corazones recibidos">
        <Heart className={`h-4 w-4 mr-1 ${hasGivenHeart ? 'fill-red-500 dark:fill-red-400' : ''}`} />
        <span>{heartsCount}</span>
      </div>
    </div>
  );
}
