
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { ReactNode } from "react";

interface MessagesLayoutProps {
  sidebar: ReactNode;
  content: ReactNode;
  showSidebar: boolean;
}

export const MessagesLayout = ({ sidebar, content, showSidebar, }: MessagesLayoutProps) => {
  return (
    <div className="min-h-screen flex bg-white dark:bg-black text-gray-900 dark:text-white">
      <Navigation />
      <main className="flex-1">
        <div className="h-[calc(100vh-64px)] flex">
          {showSidebar && (
            <Card className="w-full md:w-[380px] md:block rounded-none bg-gray-50 dark:bg-black border-r border-gray-200 dark:border-neutral-800">
              {sidebar}
            </Card>
          )}
          {content}
        </div>
      </main>
    </div>
  );
};
