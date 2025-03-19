
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

export function PasswordResetLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md space-y-6 bg-background rounded-lg shadow-sm p-6 sm:p-8 text-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Verificando token</h2>
            <p className="text-muted-foreground">Estamos validando tu solicitud de restablecimiento...</p>
          </div>
          <div className="w-full space-y-3 pt-4">
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
