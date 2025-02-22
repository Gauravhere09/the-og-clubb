
import { Card } from "@/components/ui/card";

interface ProfileContentProps {
  profileId: string;
}

export function ProfileContent({ profileId }: ProfileContentProps) {
  return (
    <Card className="p-4">
      <h2 className="font-semibold mb-4">Publicaciones</h2>
      <p className="text-muted-foreground text-center py-8">
        No hay publicaciones para mostrar
      </p>
    </Card>
  );
}
