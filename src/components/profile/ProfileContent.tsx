
import { Card } from "@/components/ui/card";

export function ProfileContent() {
  return (
    <Card className="p-4">
      <h2 className="font-semibold mb-4">Publicaciones</h2>
      <p className="text-muted-foreground text-center py-8">
        No hay publicaciones para mostrar
      </p>
    </Card>
  );
}
