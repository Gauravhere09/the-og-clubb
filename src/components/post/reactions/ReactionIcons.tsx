
export const reactionIcons = {
  like: { 
    icon: ({ className }: { className?: string }) => (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M14 10h3v7h-3z M14.5 4h-5l-1 6h7z M6.5 10H3v7h3.5z" fill="none" stroke="currentColor" strokeWidth="0.5"/>
        <path d="M14.5 4l1.5 6v7h-7l-1-5-2-2h3l1-6z" fill="currentColor"/>
      </svg>
    ), 
    color: "text-blue-500", 
    label: "Me gusta" 
  },
  love: { 
    icon: ({ className }: { className?: string }) => (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </svg>
    ), 
    color: "text-red-500", 
    label: "Me encanta" 
  },
  haha: { 
    icon: ({ className }: { className?: string }) => (
      <svg className={className} viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" fill="currentColor" />
        <path d="M7 14c0 2.5 2.5 4 5 4s5-1.5 5-4" fill="white"/>
        <path d="M7 13c0 0 2.5 2 5 2s5-2 5-2" stroke="white" strokeWidth="1"/>
        <path d="M8 10c0 0-1.5-2-3 0M16 10c0 0 1.5-2 3 0" stroke="white" strokeWidth="1.5" fill="none"/>
      </svg>
    ), 
    color: "text-yellow-500", 
    label: "Me divierte" 
  },
  wow: { 
    icon: ({ className }: { className?: string }) => (
      <svg className={className} viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" fill="currentColor"/>
        <circle cx="12" cy="12" r="3" fill="white"/>
        <circle cx="8" cy="9" r="1.5" fill="white"/>
        <circle cx="16" cy="9" r="1.5" fill="white"/>
      </svg>
    ), 
    color: "text-yellow-400", 
    label: "Me asombra" 
  },
  sad: { 
    icon: ({ className }: { className?: string }) => (
      <svg className={className} viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" fill="currentColor"/>
        <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="white" strokeWidth="1.5" fill="none"/>
        <circle cx="8.5" cy="10" r="1.5" fill="white"/>
        <circle cx="15.5" cy="10" r="1.5" fill="white"/>
      </svg>
    ), 
    color: "text-yellow-300", 
    label: "Me entristece" 
  },
  angry: { 
    icon: ({ className }: { className?: string }) => (
      <svg className={className} viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" fill="currentColor"/>
        <path d="M16 16s-1.5-2-4-2-4 2-4 2" stroke="white" strokeWidth="1.5" fill="none"/>
        <path d="M7 9l4 2M17 9l-4 2" stroke="white" strokeWidth="1.5"/>
      </svg>
    ), 
    color: "text-orange-500", 
    label: "Me enoja" 
  }
} as const;

export type ReactionType = keyof typeof reactionIcons;
