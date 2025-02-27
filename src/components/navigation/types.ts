
import { ComponentType } from "react";
import { LucideIcon } from "lucide-react";

export interface NavigationLink {
  to: string;
  icon: LucideIcon;
  label: string;
  badge?: number | null;
  onClick?: () => void;
}
