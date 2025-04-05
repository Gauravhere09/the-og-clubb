
// This file re-exports from the hooks directory for compatibility
export {
  useToast,
  ToastProvider,
  ToastViewport, 
  Toast, 
  ToastTitle, 
  ToastDescription, 
  ToastClose,
} from "@/hooks/use-toast";

export type { 
  ToasterToast,
  ToastActionElement 
} from "@/hooks/use-toast";
