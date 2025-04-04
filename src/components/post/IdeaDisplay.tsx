
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Idea, IdeaParticipant } from "@/types/post";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface IdeaDisplayProps {
  idea: Idea;
  postId: string;
}

export function IdeaDisplay({ idea, postId }: IdeaDisplayProps) {
  const [showParticipants, setShowParticipants] = useState(false);
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [profession, setProfession] = useState("");
  const [participants, setParticipants] = useState<IdeaParticipant[]>(idea.participants || []);
  const [isCurrentUserJoined, setIsCurrentUserJoined] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();

  // Verificar si el usuario actual está unido a la idea
  useEffect(() => {
    const checkCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        const userJoined = participants.some(p => p.user_id === user.id);
        setIsCurrentUserJoined(userJoined);
      }
    };
    
    checkCurrentUser();
  }, [participants]);

  const handleJoinIdea = async () => {
    if (!profession.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Debes ingresar tu profesión",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Debes iniciar sesión para unirte a una idea",
        });
        return;
      }

      // Obtener los datos del perfil del usuario
      const { data: profileData } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', user.id)
        .single();

      // Crear un nuevo participante
      const newParticipant: IdeaParticipant = {
        user_id: user.id,
        profession: profession.trim(),
        joined_at: new Date().toISOString(),
        username: profileData?.username || undefined,
        avatar_url: profileData?.avatar_url || undefined
      };

      // Actualizar la idea en la base de datos
      const updatedParticipants = [...participants, newParticipant];
      
      try {
        // Obtener la idea actual para actualizarla
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('id', postId)
          .single();
        
        if (error) {
          throw new Error("No se pudo obtener la publicación");
        }
        
        if (data) {
          // Crear el objeto actualizado con type assertion
          const updatedIdea = {
            ...idea,
            participants: updatedParticipants
          };
          
          const { error: updateError } = await supabase
            .from('posts')
            .update({ idea: updatedIdea })
            .eq('id', postId);
          
          if (updateError) throw updateError;
          
          // Actualizar el estado local
          setParticipants(updatedParticipants);
          setIsCurrentUserJoined(true);
          setIsJoinDialogOpen(false);
          
          toast({
            title: "¡Te has unido!",
            description: "Ahora eres parte de esta idea",
          });
        }
      } catch (error) {
        console.error("Error al actualizar la idea:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error al unirse a la idea:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo unir a la idea. Intenta nuevamente.",
      });
    }
  };

  return (
    <div className="border border-border rounded-md p-4 bg-card/50 space-y-3">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">{idea.title}</h3>
        <p className="text-sm whitespace-pre-wrap">{idea.description}</p>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex -space-x-2 overflow-hidden">
            {participants.slice(0, 3).map((participant, index) => (
              <Avatar key={index} className="border-2 border-background w-8 h-8">
                <AvatarImage src={participant.avatar_url} />
                <AvatarFallback>{participant.username?.[0] || "U"}</AvatarFallback>
              </Avatar>
            ))}
            {participants.length > 3 && (
              <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-muted border-2 border-background text-xs">
                +{participants.length - 3}
              </div>
            )}
          </div>
          <span className="ml-3 text-sm text-muted-foreground">
            {participants.length === 0
              ? "Sé el primero en unirte"
              : participants.length === 1
              ? "1 participante"
              : `${participants.length} participantes`}
          </span>
        </div>
        
        {!isCurrentUserJoined && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsJoinDialogOpen(true)}
            className="hidden" // Ocultamos este botón ya que se mostrará en la barra de acciones
          >
            Unirme
          </Button>
        )}
        
        {participants.length > 0 && (
          <Button 
            variant="link" 
            onClick={() => setShowParticipants(true)}
            className="text-sm p-0 h-auto"
          >
            Ver participantes
          </Button>
        )}
      </div>

      {/* Diálogo para unirse a la idea */}
      <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Unirse a la idea: {idea.title}</DialogTitle>
            <DialogDescription>
              Comparte tu profesión para que el creador de la idea sepa cómo puedes contribuir.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Tu profesión o habilidad"
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsJoinDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleJoinIdea}>
              Unirme a la idea
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para mostrar participantes */}
      <Dialog open={showParticipants} onOpenChange={setShowParticipants}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Participantes</DialogTitle>
            <DialogDescription>
              Personas que se han unido a esta idea
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 max-h-[300px] overflow-y-auto">
            <ul className="space-y-3">
              {participants.map((participant, index) => (
                <li key={index} className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={participant.avatar_url} />
                    <AvatarFallback>{participant.username?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{participant.username || "Usuario"}</span>
                    <span className="text-xs text-muted-foreground">{participant.profession}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
