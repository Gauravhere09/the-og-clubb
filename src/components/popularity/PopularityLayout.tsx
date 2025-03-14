
import React from "react";
import { Navigation } from "@/components/Navigation";
import { useIsMobile } from "@/hooks/use-mobile";

interface PopularityLayoutProps {
  children: React.ReactNode;
}

export const PopularityLayout = ({ children }: PopularityLayoutProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-muted/30">
      <div className={`${isMobile ? 'fixed bottom-0 left-0 right-0 z-10' : 'md:static md:left-0'}`}>
        <Navigation />
      </div>
      <div className={`flex-1 w-full ${!isMobile ? 'md:ml-[70px]' : ''} pb-16 md:pb-0`}>
        <main className="max-w-4xl mx-auto py-4 md:py-8 px-4 sm:px-6">
          {children}
        </main>
      </div>
    </div>
  );
};
