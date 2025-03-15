
import { useState } from "react";
import { MentionPosition } from "./types";

export function useMentionPosition() {
  const [mentionPosition, setMentionPosition] = useState<MentionPosition>({ top: 0, left: 0 });

  // Calculate position of mention list based on caret position
  const calculateMentionPosition = (
    element: HTMLTextAreaElement | HTMLInputElement, 
    mentionStart: number
  ) => {
    if (!element) return;
    
    // Get element metrics
    const inputRect = element.getBoundingClientRect();
    const text = element.value.substring(0, mentionStart);
    
    // Create a temporary hidden element to calculate text dimensions
    const temp = document.createElement('div');
    const style = window.getComputedStyle(element);
    
    // Copy all styles to ensure accurate measurement
    temp.style.position = 'absolute';
    temp.style.visibility = 'hidden';
    temp.style.whiteSpace = element instanceof HTMLTextAreaElement ? 'pre-wrap' : 'pre';
    temp.style.font = style.font;
    temp.style.padding = style.padding;
    temp.style.width = style.width;
    temp.style.lineHeight = style.lineHeight;
    temp.innerHTML = text.replace(/\n/g, '<br>').replace(/ /g, '&nbsp;');
    
    document.body.appendChild(temp);
    
    // Calculate coordinates
    const tempRect = temp.getBoundingClientRect();
    
    // Clean up
    document.body.removeChild(temp);
    
    // The left offset is the width of the text up to the caret
    // The top offset is the top of the input + the height of the text
    const top = window.scrollY + inputRect.top + (tempRect.height > 0 ? tempRect.height : parseFloat(style.lineHeight));
    const left = window.scrollX + inputRect.left + (text ? temp.clientWidth : 0);
    
    console.log("Mention position calculation:", {
      inputRect,
      tempRect,
      scrollY: window.scrollY,
      scrollX: window.scrollX,
      calculatedTop: top,
      calculatedLeft: left
    });
    
    setMentionPosition({
      top: top,
      left: left
    });
  };

  return {
    mentionPosition,
    calculateMentionPosition
  };
}
