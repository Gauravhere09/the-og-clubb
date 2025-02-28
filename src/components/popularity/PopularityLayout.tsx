
import { ReactNode } from "react";
import { Navigation } from "@/components/Navigation";

interface PopularityLayoutProps {
  children: ReactNode;
}

export const PopularityLayout = ({ children }: PopularityLayoutProps) => {
  return (
    <div className="flex min-h-screen bg-background">
      <Navigation />
      <main className="flex-1 pl-[70px]">
        <div className="container py-6 max-w-6xl">
          {children}
        </div>
      </main>
    </div>
  );
};
