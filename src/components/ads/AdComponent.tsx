
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface AdComponentProps {
  format?: "feed" | "sidebar" | "banner";
  className?: string;
}

export function AdComponent({ format = "feed", className = "" }: AdComponentProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [adKey, setAdKey] = useState(Math.random().toString(36).substring(2, 11));
  const isMobile = useIsMobile();
  
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
    if (isMobile) {
      return format === "banner" ? "min-height-[90px]" : "min-height-[120px]";
    }
    
    switch (format) {
      case "feed":
        return "min-height-[180px]"; 
      case "sidebar":
        return "min-height-[250px]";
      case "banner":
        return "min-height-[90px]";
      default:
        return "min-height-[180px]";
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
    <Card className={`overflow-hidden ${className} ad-container ${format === "feed" ? "max-w-full rounded-lg shadow-sm post-like" : ""}`}>
      <div className="text-xs text-muted-foreground p-1.5 px-3 border-b border-border flex items-center">
        <span className="mr-1">Publicidad</span>
      </div>
      <div className={`${getAdStyle()} flex items-center justify-center`}>
        <ins
          className="adsbygoogle"
          style={{ 
            display: "block", 
            minHeight: format === "banner" ? "90px" : isMobile ? "120px" : "180px", 
            width: "100%" 
          }}
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
