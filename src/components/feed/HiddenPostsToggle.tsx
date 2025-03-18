
interface HiddenPostsToggleProps {
  count: number;
  showHidden: boolean;
  onToggle: () => void;
}

export function HiddenPostsToggle({ 
  count, 
  showHidden, 
  onToggle 
}: HiddenPostsToggleProps) {
  if (count === 0) return null;
  
  return (
    <div className="flex justify-center">
      <button 
        onClick={onToggle}
        className="text-sm text-primary hover:underline px-3 py-1.5 rounded-full bg-primary/5"
      >
        {showHidden 
          ? "Ocultar filtradas" 
          : `Mostrar ${count} ${count === 1 ? 'publicación oculta' : 'publicaciones ocultas'}`}
      </button>
    </div>
  );
}
