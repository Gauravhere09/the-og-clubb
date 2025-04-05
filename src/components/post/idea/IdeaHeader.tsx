
import { Idea } from "@/types/post";

interface IdeaHeaderProps {
  title: string;
  description: string;
}

export function IdeaHeader({ title, description }: IdeaHeaderProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="text-sm whitespace-pre-wrap">{description}</p>
    </div>
  );
}
