
/**
 * Processes reaction data to create mappings of reactions by post
 */
export function processReactionsData(reactionsData: Array<{ post_id: string; reaction_type: string }>) {
  return reactionsData.reduce((acc, reaction) => {
    if (!acc[reaction.post_id]) {
      acc[reaction.post_id] = { count: 0, by_type: {} };
    }
    acc[reaction.post_id].count++;
    acc[reaction.post_id].by_type[reaction.reaction_type] = 
      (acc[reaction.post_id].by_type[reaction.reaction_type] || 0) + 1;
    return acc;
  }, {} as Record<string, { count: number; by_type: Record<string, number> }>);
}

/**
 * Processes comments data to create comment count mappings by post
 */
export function processCommentsData(commentsData: Array<{ post_id: string }>) {
  return commentsData.reduce((acc, comment) => {
    acc[comment.post_id] = (acc[comment.post_id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}
