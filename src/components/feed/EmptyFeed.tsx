
import { Ghost } from "lucide-react";

interface EmptyFeedProps {
  userId?: string;
}

export function EmptyFeed({ userId }: EmptyFeedProps) {
  // Mostrar un mensaje diferente si estamos en el perfil de un usuario
  const message = userId 
    ? "Este usuario aún no ha publicado nada"
    : "No hay publicaciones para mostrar";

  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <Ghost className="w-12 h-12 text-muted-foreground mb-2" />
      <h3 className="text-lg font-medium">{message}</h3>
      <p className="text-muted-foreground max-w-md">
        {userId 
          ? "Cuando este usuario comparta una publicación, aparecerá aquí"
          : "Las publicaciones de tus amigos aparecerán aquí"}
      </p>
    </div>
  );
}
