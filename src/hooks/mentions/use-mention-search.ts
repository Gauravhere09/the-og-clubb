
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MentionUser } from "./types";

export function useMentionSearch() {
  const [mentionSearch, setMentionSearch] = useState("");
  const [mentionUsers, setMentionUsers] = useState<MentionUser[]>([]);
  const { toast } = useToast();

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

  return {
    mentionUsers,
    mentionSearch,
    setMentionSearch
  };
}
