
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center"
      >
        <ChevronLeft strokeWidth={1.5} className="h-4 w-4" aria-hidden="true" />
        <span className="ml-1">Anterior</span>
      </Button>
      
      <div className="mx-2 text-sm text-muted-foreground">
        Página {currentPage} de {totalPages}
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center"
      >
        <span className="mr-1">Siguiente</span>
        <ChevronRight strokeWidth={1.5} className="h-4 w-4" aria-hidden="true" />
      </Button>
    </div>
  );
};
