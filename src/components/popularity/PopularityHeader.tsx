
import { FilterButtons } from "@/components/popularity/FilterButtons";

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
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold mb-4">Ranking de Popularidad</h1>
      <p className="text-muted-foreground mb-6">
        Los usuarios con más corazones (seguidores) ocupan los primeros lugares. ¡Sigue a otros usuarios para ganar popularidad!
      </p>

      {careerFilters.length > 0 ? (
        <FilterButtons 
          careerFilters={careerFilters}
          currentFilter={currentFilter}
          onFilterChange={onFilterChange}
        />
      ) : (
        <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
          <h3 className="font-medium mb-2">Información</h3>
          <p className="text-sm">No hay carreras disponibles para filtrar. Los filtros aparecerán cuando los usuarios agreguen información académica.</p>
        </div>
      )}
    </div>
  );
};
