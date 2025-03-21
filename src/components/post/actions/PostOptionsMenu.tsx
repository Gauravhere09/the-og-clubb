
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePostOptions } from "./hooks/use-post-options";
import { InterestMenuItems } from "./menu-items/InterestMenuItems";
import { VisibilityMenuItems } from "./menu-items/VisibilityMenuItems";
import { ReportMenuItem } from "./menu-items/ReportMenuItem";

interface PostOptionsMenuProps {
  postId: string;
  postUserId: string;
  isHidden?: boolean;
  onHideToggle?: () => void;
}

export function PostOptionsMenu({ 
  postId, 
  postUserId, 
  isHidden = false,
  onHideToggle
}: PostOptionsMenuProps) {
  const {
    isLoading,
    open,
    setOpen,
    username,
    handleSetInterest,
    handleHidePost,
    handleHideUser,
    handleReportPost
  } = usePostOptions({
    postId,
    postUserId,
    isHidden,
    onHideToggle
  });

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Opciones de publicación"
          disabled={isLoading}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-52 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-md z-[9999]"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenuLabel>Opciones</DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <InterestMenuItems onSetInterest={handleSetInterest} />
        
        <VisibilityMenuItems 
          isHidden={isHidden}
          username={username}
          onHidePost={handleHidePost}
          onHideUser={handleHideUser}
        />
        
        <ReportMenuItem onReportPost={handleReportPost} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
