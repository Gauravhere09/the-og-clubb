
import { Card } from "@/components/ui/card";
import { useState, useEffect, useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface AdComponentProps {
  format?: "feed" | "sidebar" | "banner";
  className?: string;
}

export function AdComponent({ format = "feed", className = "" }: AdComponentProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [adVisible, setAdVisible] = useState(false);
  const adRef = useRef<HTMLDivElement>(null);
  const adInitialized = useRef(false);
  const isMobile = useIsMobile();
  
  // Get minimum height based on format and device
  const getMinHeight = () => {
    if (isMobile) {
      return format === "banner" ? "90px" : "120px";
    }
    
    switch (format) {
      case "feed":
        return "180px"; 
      case "sidebar":
        return "250px";
      case "banner":
        return "90px";
      default:
        return "180px";
    }
  };
  
  // Get ad slot based on format
  const getAdSlot = () => {
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
  
  useEffect(() => {
    // Wait for the component to be properly rendered
    // and have actual dimensions before initializing ads
    const timeoutId = setTimeout(() => {
      setAdVisible(true);
    }, 200); // Increased timeout for better initial rendering
    
    return () => clearTimeout(timeoutId);
  }, []);
  
  useEffect(() => {
    // Only initialize ad when component is visible and has dimensions
    if (adVisible && adRef.current && window.adsbygoogle && !adInitialized.current) {
      const adElement = adRef.current.querySelector('.adsbygoogle');
      
      if (adElement && adElement.getBoundingClientRect().width > 0) {
        try {
          adInitialized.current = true;
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          setIsLoaded(true);
        } catch (e) {
          console.error("AdSense error:", e);
        }
      } else {
        // If ad container still doesn't have width, retry after a short delay
        const retryTimeoutId = setTimeout(() => {
          setAdVisible(false);
          setTimeout(() => setAdVisible(true), 50); // Increased retry timing
        }, 300);
        
        return () => clearTimeout(retryTimeoutId);
      }
    }
  }, [adVisible]);
  
  const minHeight = getMinHeight();
  
  return (
    <Card className={`overflow-hidden ${className} ad-container ${format === "feed" ? "max-w-full rounded-lg shadow-sm post-like" : ""}`}>
      <div className="text-xs text-muted-foreground p-1.5 px-3 border-b border-border flex items-center">
        <span className="mr-1">Publicidad</span>
      </div>
      <div 
        className="flex items-center justify-center"
        style={{ minHeight, width: "100%" }}
      >
        {adVisible && (
          <div ref={adRef} style={{ width: '100%', minHeight, overflow: 'hidden' }}>
            <ins
              className="adsbygoogle"
              style={{ 
                display: "block", 
                minHeight,
                width: "100%" 
              }}
              data-ad-client="ca-pub-9230569145726089"
              data-ad-slot={getAdSlot()}
              data-ad-format="auto"
              data-full-width-responsive="true"
            />
          </div>
        )}
      </div>
    </Card>
  );
}
