
import { useContext } from "react";
import { ToastContext } from "@/components/ui/toast";

export function useToast() {
  const context = useContext(ToastContext);

  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return {
    toast: context.toast,
    dismiss: (toastId?: string) => context.toast.dismiss(toastId)
  };
}

export { 
  ToastProvider, 
  ToastViewport, 
  Toast, 
  ToastTitle, 
  ToastDescription, 
  ToastClose, 
} from "@/components/ui/toast";

export type { 
  Toast as ToasterToast,
  ToastActionElement 
} from "@/components/ui/toast";
