
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PollOption } from "@/types/post";

interface VoterListProps {
  option: PollOption;
  votes: VoteWithUser[];
  percentage: number;
}

export interface VoteWithUser {
  option_id: string;
  profiles: {
    username: string;
    avatar_url: string | null;
  };
  created_at: string;
}

export function VotersList({ option, votes, percentage }: VoterListProps) {
  const optionVotes = votes.filter(v => v.option_id === option.id);
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <span className="font-medium">{option.content}</span>
        <span>
          {optionVotes.length} {optionVotes.length === 1 ? "voto" : "votos"} ({percentage}%)
        </span>
      </div>
      <Progress value={percentage} className="h-2" />
      {optionVotes.length > 0 && (
        <div className="pt-2 space-y-2">
          {optionVotes.map((vote, index) => (
            <div key={`${vote.option_id}-${vote.profiles.username}-${index}`} className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={vote.profiles.avatar_url || undefined} />
                <AvatarFallback>{vote.profiles.username?.[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{vote.profiles.username}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(vote.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
