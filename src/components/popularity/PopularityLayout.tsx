
import React from "react";
import { Navigation } from "@/components/Navigation";

interface PopularityLayoutProps {
  children: React.ReactNode;
}

export const PopularityLayout = ({ children }: PopularityLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-muted/30">
      <div className="fixed bottom-0 left-0 right-0 md:static md:left-0 z-10">
        <Navigation />
      </div>
      <div className="flex-1 w-full md:ml-[70px] pb-16 md:pb-0">
        <main className="max-w-4xl mx-auto py-4 md:py-8 px-4 sm:px-6">
          {children}
        </main>
      </div>
    </div>
  );
};
