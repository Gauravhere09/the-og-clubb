
import { Post, Poll } from "@/types/post";
import { RawPost, ReactionType } from "./types";

export function transformPollData(pollData: any): Poll | null {
  if (!pollData) return null;
  
  return {
    question: pollData.question as string,
    options: (pollData.options || []).map((opt: any) => ({
      id: opt.id as string,
      content: opt.content as string,
      votes: opt.votes as number
    })),
    total_votes: pollData.total_votes as number,
    user_vote: pollData.user_vote as string | null
  };
}

export function createPollData(question: string, options: string[]) {
  return {
    question,
    options: options.map((content) => ({
      id: crypto.randomUUID(),
      content,
      votes: 0
    })),
    total_votes: 0,
    user_vote: null
  };
}

export function processMediaFile(file: File): { media_url: string | null; media_type: string | null } {
  const media_type = file.type.startsWith('image/') ? 'image' :
                    file.type.startsWith('video/') ? 'video' :
                    file.type.startsWith('audio/') ? 'audio' : null;
  
  return { media_url: null, media_type };
}

export function transformRawPost(
  rawPost: RawPost,
  profiles?: { username: string | null; avatar_url: string | null },
  reactionsMap: Record<string, { count: number; by_type: Record<string, number> }> = {},
  userReactionsMap: Record<string, ReactionType> = {},
  commentsCountMap: Record<string, number> = {}
): Post {
  return {
    id: rawPost.id,
    content: rawPost.content,
    user_id: rawPost.user_id,
    media_url: rawPost.media_url,
    media_type: rawPost.media_type as 'image' | 'video' | 'audio' | null,
    visibility: rawPost.visibility as 'public' | 'friends' | 'private',
    created_at: rawPost.created_at,
    updated_at: rawPost.updated_at,
    profiles: profiles || rawPost.profiles,
    poll: transformPollData(rawPost.poll),
    user_reaction: userReactionsMap[rawPost.id] || null,
    reactions: reactionsMap[rawPost.id] || { count: 0, by_type: {} },
    reactions_count: reactionsMap[rawPost.id]?.count || 0,
    comments_count: commentsCountMap[rawPost.id] || 0
  };
}
