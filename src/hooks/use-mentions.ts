
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";

interface MentionUser {
  id: string;
  username: string;
  avatar_url: string | null;
}

export function useMentions() {
  const [mentionSearch, setMentionSearch] = useState("");
  const [mentionUsers, setMentionUsers] = useState<MentionUser[]>([]);
  const [mentionListVisible, setMentionListVisible] = useState(false);
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const [mentionIndex, setMentionIndex] = useState(-1);
  const [caretPosition, setCaretPosition] = useState<number | null>(null);
  const { toast } = useToast();

  // Debug state changes
  useEffect(() => {
    console.log("Mention state changed:", { 
      mentionSearch, 
      mentionListVisible, 
      mentionUsers: mentionUsers.length 
    });
  }, [mentionSearch, mentionListVisible, mentionUsers.length]);

  // Search for users when mentionSearch changes
  useEffect(() => {
    if (mentionSearch.length === 0) {
      setMentionUsers([]);
      return;
    }

    const searchForUsers = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        console.log("Searching for users with query:", mentionSearch);
        
        // Fetch up to 5 users whose usernames match the search string
        const { data, error } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .neq('id', user.id)
          .ilike('username', `%${mentionSearch}%`)
          .order('username')
          .limit(5);

        if (error) {
          console.error("Error fetching users for mention:", error);
          throw error;
        }
        
        // Log results to help debugging
        console.log("Mention search results:", data);
        setMentionUsers(data || []);
        
        // If we have results, ensure the list is visible
        if (data && data.length > 0) {
          setMentionListVisible(true);
        }
      } catch (error) {
        console.error('Error searching for users:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar los usuarios para mención"
        });
      }
    };

    // Always search if we have at least one character to make sure results show up
    if (mentionSearch.length > 0) {
      searchForUsers();
    }
  }, [mentionSearch, toast]);

  // Calculate mention string position in text
  const getMentionIndices = (text: string, caretPos: number) => {
    let startIndex = caretPos - 1;
    
    // Find the @ character before the cursor
    while (startIndex >= 0 && text[startIndex] !== '@') {
      startIndex--;
    }
    
    // If we didn't find @ or it's not preceded by a space or start of text, no valid mention
    if (startIndex < 0) {
      return null;
    }
    
    // Make sure @ is at beginning of text or has a space/newline before it
    if (startIndex > 0 && !/[\s\n]/.test(text[startIndex - 1])) {
      return null;
    }
    
    // Log the found indices for debugging
    console.log("Found mention indices:", { 
      start: startIndex, 
      end: caretPos, 
      query: text.substring(startIndex + 1, caretPos) 
    });
    
    return {
      start: startIndex,
      end: caretPos,
      query: text.substring(startIndex + 1, caretPos)
    };
  };

  // Handle text changes to detect mentions
  const handleTextChange = (
    text: string, 
    caretPos: number, 
    inputElement: HTMLTextAreaElement | HTMLInputElement
  ) => {
    // Always log caret position to help with debugging
    console.log("Current caret position:", caretPos);
    console.log("Current text:", text);
    
    const mentionIndices = getMentionIndices(text, caretPos);
    
    if (mentionIndices) {
      console.log("Mention detected:", mentionIndices.query);
      setMentionSearch(mentionIndices.query);
      setMentionListVisible(true);
      setCaretPosition(caretPos);
      setMentionIndex(-1); // Reset selection index when search changes
      
      // Calculate position of mention list
      calculateMentionPosition(inputElement, mentionIndices.start);
    } else {
      // Only hide the list if it's currently visible
      if (mentionListVisible) {
        console.log("Hiding mention list - no valid mention pattern");
        setMentionListVisible(false);
        setMentionSearch("");
      }
    }
  };

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

  // Insert selected mention into text
  const insertMention = (text: string, user: MentionUser) => {
    if (caretPosition === null) return text;
    
    const mentionIndices = getMentionIndices(text, caretPosition);
    if (!mentionIndices) return text;
    
    const before = text.substring(0, mentionIndices.start);
    const after = text.substring(mentionIndices.end);
    
    // Reset mention state
    setMentionListVisible(false);
    setMentionSearch("");
    setMentionIndex(-1);
    
    console.log("Inserting mention:", { 
      before, 
      user: user.username, 
      after
    });
    
    return `${before}@${user.username} ${after}`;
  };

  return {
    mentionUsers,
    mentionListVisible,
    mentionPosition,
    mentionIndex,
    setMentionIndex,
    handleTextChange,
    insertMention,
    setMentionListVisible
  };
}
