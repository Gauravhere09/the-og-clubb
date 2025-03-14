
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";

interface PopularityHeaderProps {
  careerFilters: string[];
  currentFilter: string | null;
  onFilterChange: (filter: string | null) => void;
}

export const PopularityHeader = ({ 
  careerFilters, 
  currentFilter, 
  onFilterChange 
}: PopularityHeaderProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="mb-6">
      <div className={`flex ${isMobile ? 'flex-col gap-2' : 'justify-between items-center'} mb-4`}>
        <h1 className="text-xl md:text-2xl font-bold">Ranking de Popularidad</h1>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className={isMobile ? 'self-end' : ''}>
                <HelpCircle className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side={isMobile ? "bottom" : "left"} className="max-w-md">
              <p>Este ranking muestra a los usuarios con mayor número de seguidores en la plataforma.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-2 filter-buttons">
        <Button 
          variant={currentFilter === null ? "default" : "outline"} 
          size="sm"
          onClick={() => onFilterChange(null)}
          className="text-sm md:text-base"
        >
          Todos
        </Button>
        
        {careerFilters.map((filter) => (
          <Button
            key={filter}
            variant={currentFilter === filter ? "default" : "outline"}
            size="sm"
            onClick={() => onFilterChange(filter)}
            className="text-sm md:text-base"
          >
            {filter}
          </Button>
        ))}
      </div>
    </div>
  );
};
