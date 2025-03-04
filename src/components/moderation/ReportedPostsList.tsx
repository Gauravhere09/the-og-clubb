
import React from "react";
import { Card } from "@/components/ui/card";
import { ReportedPost } from "@/types/database/moderation.types";

interface ReportedPostsListProps {
  reportedPosts: ReportedPost[];
  selectedPost: string | null;
  onSelectPost: (postId: string) => void;
}

const ReportedPostsList: React.FC<ReportedPostsListProps> = ({
  reportedPosts,
  selectedPost,
  onSelectPost,
}) => {
  return (
    <Card className="p-4">
      <h2 className="text-lg font-medium mb-4">Publicaciones reportadas</h2>
      <div className="space-y-2">
        {reportedPosts.map((post) => (
          <div
            key={post.post_id}
            className={`p-3 rounded-md cursor-pointer flex justify-between ${
              selectedPost === post.post_id
                ? "bg-accent"
                : "hover:bg-muted"
            }`}
            onClick={() => onSelectPost(post.post_id)}
          >
            <div className="truncate">
              {post.posts.profiles.username || "Usuario"}
            </div>
            <div className="text-sm font-semibold text-destructive">
              {post.count} reportes
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ReportedPostsList;
