
import { useState } from "react";
import { StoryPrivacySettings } from "@/components/settings/StoryPrivacySettings";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PrivacySettings() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="container max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center mb-6 gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Privacidad</h1>
      </div>

      <div className="space-y-4">
        <Button 
          variant="outline" 
          className="w-full justify-start h-14 bg-white dark:bg-card shadow"
          onClick={() => setIsDialogOpen(true)}
        >
          <span>Configurar la privacidad de historias</span>
        </Button>

        <StoryPrivacySettings 
          open={isDialogOpen} 
          onOpenChange={setIsDialogOpen}
        />
      </div>
    </div>
  );
}
