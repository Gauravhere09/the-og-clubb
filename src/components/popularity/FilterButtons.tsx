
import { Button } from "@/components/ui/button";

interface FilterButtonsProps {
  careerFilters: string[];
  currentFilter: string | null;
  onFilterChange: (filter: string | null) => void;
}

export const FilterButtons = ({ careerFilters, currentFilter, onFilterChange }: FilterButtonsProps) => {
  if (careerFilters.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <Button 
        variant={currentFilter === null ? "default" : "outline"}
        size="sm"
        onClick={() => onFilterChange(null)}
      >
        Todos
      </Button>
      {careerFilters.map((career) => (
        <Button
          key={career}
          variant={currentFilter === career ? "default" : "outline"}
          size="sm"
          onClick={() => onFilterChange(career)}
        >
          {career}
        </Button>
      ))}
    </div>
  );
};
