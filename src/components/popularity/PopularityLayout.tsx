
import React from "react";

interface PopularityLayoutProps {
  children: React.ReactNode;
}

export const PopularityLayout = ({ children }: PopularityLayoutProps) => {
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {children}
    </div>
  );
};
