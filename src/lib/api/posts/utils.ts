
import { Poll } from "@/types/post";
import { TransformedPoll } from "./types";

export function transformPoll(pollData: any): Poll | null {
  if (!pollData) return null;
  
  if (typeof pollData === 'object') {
    return {
      question: pollData.question,
      options: Array.isArray(pollData.options) ? pollData.options.map((opt: any) => ({
        id: opt.id,
        content: opt.content,
        votes: Number(opt.votes)
      })) : [],
      total_votes: Number(pollData.total_votes || 0),
      user_vote: pollData.user_vote || null
    };
  }
  
  return null;
}
