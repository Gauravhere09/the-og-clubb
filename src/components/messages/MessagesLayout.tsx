
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
    <div className="min-h-screen flex flex-col md:flex-row bg-white dark:bg-black text-gray-900 dark:text-white">
      <div className="fixed bottom-0 left-0 right-0 md:static md:left-0 z-10">
        <Navigation />
      </div>
      <main className="flex-1 w-full md:ml-[70px] pb-16 md:pb-0">
        <div className="h-[calc(100vh-64px)] flex flex-col md:flex-row max-w-6xl mx-auto">
          {showSidebar && (
            <Card className={`${isMobile ? 'w-full' : 'w-[350px]'} md:block rounded-none bg-gray-50 dark:bg-black border-r border-gray-200 dark:border-neutral-800`}>
              {sidebar}
            </Card>
          )}
          <div className="flex-1 flex flex-col overflow-hidden">
            {content}
          </div>
        </div>
      </main>
    </div>
  );
};
