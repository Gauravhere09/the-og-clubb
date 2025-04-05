
import { useContext } from "react"
import { ToasterToast, ToastActionElement } from "@/components/ui/toaster"

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

import { ToastContext } from "@/components/ui/toast"

export function useToast() {
  const { toast } = useContext(ToastContext)

  return {
    toast,
    dismiss: (toastId?: string) => toast.dismiss(toastId)
  }
}

export { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastClose, ToastActionElement }
export type { ToasterToast }
