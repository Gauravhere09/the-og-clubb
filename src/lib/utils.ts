import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formatea una fecha en un formato relativo (por ejemplo, "12 semanas", "1 año(s)")
 */
export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
  
  // Si es más de un año
  if (diffInDays >= 365) {
    const years = Math.floor(diffInDays / 365);
    return `${years} año${years > 1 ? '(s)' : ''}`;
  }
  
  // Si es más de una semana
  if (diffInDays >= 7) {
    const weeks = Math.floor(diffInDays / 7);
    return `${weeks} semana${weeks > 1 ? 's' : ''}`;
  }
  
  // Si es más de un día
  if (diffInDays >= 1) {
    const days = Math.floor(diffInDays);
    return `${days} día${days > 1 ? 's' : ''}`;
  }
  
  // Si es menos de un día
  return "Hoy";
}
