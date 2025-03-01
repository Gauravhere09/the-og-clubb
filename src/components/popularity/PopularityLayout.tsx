
import React from "react";
import { Navigation } from "@/components/Navigation";

interface PopularityLayoutProps {
  children: React.ReactNode;
}

export const PopularityLayout = ({ children }: PopularityLayoutProps) => {
  return (
    <div className="min-h-screen flex bg-muted/30">
      <Navigation />
      <main className="flex-1 md:ml-[70px] pb-20 md:pb-0">
        <div className="container max-w-4xl mx-auto py-8 px-4 sm:px-6">
          {children}
        </div>
      </main>
    </div>
  );
};
