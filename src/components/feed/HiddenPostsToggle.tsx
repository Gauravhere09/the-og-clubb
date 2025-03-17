
interface HiddenPostsToggleProps {
  hiddenPostsCount: number;
  showHidden: boolean;
  onToggleHidden: () => void;
}

export function HiddenPostsToggle({ 
  hiddenPostsCount, 
  showHidden, 
  onToggleHidden 
}: HiddenPostsToggleProps) {
  if (hiddenPostsCount === 0) return null;
  
  return (
    <div className="flex justify-center mb-2">
      <button 
        onClick={onToggleHidden}
        className="text-sm text-primary hover:underline"
      >
        {showHidden 
          ? "Ocultar publicaciones filtradas" 
          : `Mostrar ${hiddenPostsCount} publicaciones ocultas`}
      </button>
    </div>
  );
}
