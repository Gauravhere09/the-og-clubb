
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { ReactNode } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface MessagesLayoutProps {
  sidebar: ReactNode;
  content: ReactNode;
  showSidebar: boolean;
}

export const MessagesLayout = ({ sidebar, content, showSidebar }: MessagesLayoutProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen flex bg-white dark:bg-black text-gray-900 dark:text-white">
      <Navigation />
      <main className="flex-1 flex justify-center">
        <div className="h-[calc(100vh-64px)] flex max-w-6xl w-full">
          {showSidebar && (
            <Card className={`${isMobile ? 'w-full' : 'w-[350px]'} md:block rounded-none bg-gray-50 dark:bg-black border-r border-gray-200 dark:border-neutral-800`}>
              {sidebar}
            </Card>
          )}
          {content}
        </div>
      </main>
    </div>
  );
};
