
import { type ReactionType } from "@/types/database/social.types";

/**
 * Processes and transforms reaction data from database into a more usable format
 * @param reactions Raw reaction data from the database
 * @returns Processed reaction data with counts by type
 */
export function processReactions(reactions: any[]) {
  // If no reactions, return empty defaults
  if (!reactions || reactions.length === 0) {
    return {
      total: 0,
      by_type: {},
      recent_users: []
    };
  }

  // Count reactions by type
  const byType: Record<string, number> = {};
  const users: string[] = [];

  reactions.forEach(reaction => {
    const type = reaction.reaction_type as ReactionType;
    byType[type] = (byType[type] || 0) + 1;
    
    // Track unique users for recent reactions (limit to 3)
    if (users.length < 3 && !users.includes(reaction.user_id)) {
      users.push(reaction.user_id);
    }
  });

  return {
    total: reactions.length,
    by_type: byType,
    recent_users: users
  };
}
