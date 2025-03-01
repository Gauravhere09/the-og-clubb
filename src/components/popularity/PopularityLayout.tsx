
import React from "react";
import { Navigation } from "@/components/Navigation";

interface PopularityLayoutProps {
  children: React.ReactNode;
}

export const PopularityLayout = ({ children }: PopularityLayoutProps) => {
  return (
    <div className="min-h-screen flex bg-muted/30">
      <Navigation />
      <div className="flex-1 flex justify-center md:ml-[70px] pb-20 md:pb-0">
        <main className="w-full max-w-4xl py-8 px-4 sm:px-6">
          {children}
        </main>
      </div>
    </div>
  );
};
