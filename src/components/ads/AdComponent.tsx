
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";

interface AdComponentProps {
  format?: "feed" | "sidebar" | "banner";
  className?: string;
}

export function AdComponent({ format = "feed", className = "" }: AdComponentProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [adKey, setAdKey] = useState(Math.random().toString(36).substring(2, 11));
  
  useEffect(() => {
    // Load the ad after component mounts
    if (window.adsbygoogle) {
      try {
        setIsLoaded(true);
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error("AdSense error:", e);
      }
    }
  }, [adKey]);
  
  const getAdStyle = () => {
    switch (format) {
      case "feed":
        return "min-height-[150px] w-full"; 
      case "sidebar":
        return "min-height-[250px] w-full";
      case "banner":
        return "min-height-[90px] w-full";
      default:
        return "min-height-[150px] w-full";
    }
  };
  
  const getAdSlot = () => {
    // You can customize the ad slots based on format
    switch (format) {
      case "feed":
        return "1234567890"; // Replace with your actual ad slot ID
      case "sidebar":
        return "0987654321"; // Replace with your actual ad slot ID
      case "banner":
        return "1029384756"; // Replace with your actual ad slot ID
      default:
        return "1234567890"; // Replace with your actual ad slot ID
    }
  };
  
  return (
    <Card className={`overflow-hidden ${className} ad-container mb-4 p-0`}>
      <div className="text-xs text-muted-foreground p-1 border-b border-border">
        Publicidad
      </div>
      <div className={`${getAdStyle()} flex items-center justify-center`}>
        <ins
          className="adsbygoogle"
          style={{ display: "block", minHeight: format === "banner" ? "90px" : "200px", width: "100%" }}
          data-ad-client="ca-pub-9230569145726089"
          data-ad-slot={getAdSlot()}
          data-ad-format="auto"
          data-full-width-responsive="true"
          key={adKey}
        />
      </div>
    </Card>
  );
}
