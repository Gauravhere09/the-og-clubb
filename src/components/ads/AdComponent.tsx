
import { Card } from "@/components/ui/card";
import { useState, useEffect, useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface AdComponentProps {
  format?: "feed" | "sidebar" | "banner";
  className?: string;
}

export function AdComponent({ format = "feed", className = "" }: AdComponentProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const adRef = useRef<HTMLDivElement>(null);
  const adInitialized = useRef(false);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    // Only initialize the ad once per instance
    if (!adInitialized.current && adRef.current && window.adsbygoogle) {
      try {
        adInitialized.current = true;
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        setIsLoaded(true);
      } catch (e) {
        console.error("AdSense error:", e);
      }
    }
  }, []);
  
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
        <div ref={adRef}>
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
          />
        </div>
      </div>
    </Card>
  );
}
