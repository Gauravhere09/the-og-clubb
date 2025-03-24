
import { Button } from "@/components/ui/button";
import { Idea } from "@/types/post";
import { Users } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TransformedIdea } from "@/lib/api/posts/types";

interface IdeaDisplayProps {
  idea: Idea;
  postId: string;
  isParticipant: boolean;
}

export function IdeaDisplay({ idea, postId, isParticipant = false }: IdeaDisplayProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { mutate: joinIdea, isPending } = useMutation({
    mutationFn: async () => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario no autenticado");

      // Get user profile data
      const { data: profileData } = await supabase
        .from('profiles')
        .select('username, avatar_url, career')
        .eq('id', user.id)
        .single();

      if (!profileData) throw new Error("No se pudo obtener el perfil del usuario");

      // Get current post data
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .select('idea')
        .eq('id', postId)
        .single();

      if (postError || !postData) throw new Error("No se pudo obtener la publicación");

      // Parse and validate the idea data
      const ideaData = postData.idea as unknown as TransformedIdea | null;
      
      const currentIdea = ideaData || {
        description: idea.description,
        participants: [],
        participants_count: 0,
      };

      // Check if user is already a participant
      const alreadyParticipant = currentIdea.participants?.some(
        (p) => p.user_id === user.id
      );

      if (alreadyParticipant) {
        return { alreadyParticipant: true };
      }

      // Add user to participants
      const newParticipant = {
        user_id: user.id,
        username: profileData.username || "",
        avatar_url: profileData.avatar_url,
        career: profileData.career,
        joined_at: new Date().toISOString()
      };

      const updatedIdea: TransformedIdea = {
        ...currentIdea,
        participants: [...(currentIdea.participants || []), newParticipant],
        participants_count: (currentIdea.participants_count || 0) + 1,
      };

      // Update post with new idea data
      const { error: updateError } = await supabase
        .from('posts')
        .update({ idea: updatedIdea })
        .eq('id', postId);

      if (updateError) throw updateError;

      return { 
        success: true, 
        updatedIdea,
        alreadyParticipant: false 
      };
    },
    onSuccess: (data) => {
      if (data.alreadyParticipant) {
        toast({
          title: "Ya te has unido",
          description: "Ya formas parte de esta idea",
        });
      } else {
        toast({
          title: "¡Te has unido!",
          description: "Ahora formas parte de esta idea",
        });
        queryClient.invalidateQueries({ queryKey: ['posts'] });
      }
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Ocurrió un error al unirte a la idea",
      });
    },
  });

  return (
    <div className="space-y-3">
      <div className="text-sm whitespace-pre-wrap break-words">
        <strong>Idea: </strong>{idea.description}
      </div>

      <div className="flex items-center justify-between">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
            >
              <Users className="h-4 w-4" />
              <span>{idea.participants_count || 0} profesionales unidos</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Profesionales unidos a esta idea</DialogTitle>
              <DialogDescription>
                Estos son los profesionales que se han unido a esta idea
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto mt-4">
              {idea.participants && idea.participants.length > 0 ? (
                <div className="space-y-4">
                  {idea.participants.map((participant) => (
                    <div key={participant.user_id} className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={participant.avatar_url || undefined} />
                        <AvatarFallback>{participant.username?.[0] || 'U'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{participant.username}</p>
                        <p className="text-sm text-muted-foreground">
                          {participant.career || "Profesional"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-6 text-muted-foreground">Aún no hay participantes</p>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {!isParticipant && (
          <Button 
            onClick={() => joinIdea()} 
            disabled={isPending}
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <Users className="h-4 w-4" />
            Unirse a la idea
          </Button>
        )}
      </div>
    </div>
  );
}
