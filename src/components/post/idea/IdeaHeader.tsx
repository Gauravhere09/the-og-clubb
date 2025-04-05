
import { Badge } from "@/components/ui/badge";
import { Lightbulb } from "lucide-react";

interface IdeaHeaderProps {
  title: string;
}

export function IdeaHeader({ title }: IdeaHeaderProps) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Badge variant="idea" className="flex items-center gap-1 py-1">
        <Lightbulb className="h-3.5 w-3.5" />
        <span>Idea</span>
      </Badge>
      <h3 className="text-lg font-medium text-blue-700 dark:text-blue-300">{title}</h3>
    </div>
  );
}
