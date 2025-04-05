import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Light mode colors (White and Blue)
        background: "240 100% 99%", // Almost pure white
        foreground: "240 10% 10%", // Nearly black text
        primary: {
          DEFAULT: "#1A73E8", // Nuevo color azul solicitado
          foreground: "240 100% 99%", // White text on blue
        },
        secondary: {
          DEFAULT: "#F0F4F8", // Light blue-gray
          foreground: "240 10% 10%",
        },
        
        // Dark mode colors (Black and Blue)
        dark: {
          background: "240 10% 3.9%", // Nearly black background
          foreground: "0 0% 98%", // Nearly white text
          primary: {
            DEFAULT: "#1A73E8", // Mantenemos el mismo azul en dark mode
            foreground: "0 0% 98%", // White text
          },
          secondary: {
            DEFAULT: "#34495E", // Slightly lighter dark blue
            foreground: "0 0% 98%",
          }
        },
        
        // Keeping other color definitions for consistency
        destructive: {
          DEFAULT: "hsl(0 62.8% 30.6%)",
          foreground: "0 0% 98%",
        },
        muted: {
          DEFAULT: "240 4.8% 95.9%",
          foreground: "240 3.8% 46.1%",
        },
        accent: {
          DEFAULT: "240 4.8% 95.9%",
          foreground: "240 5.9% 10%",
        },
        popover: {
          DEFAULT: "0 0% 100%",
          foreground: "240 10% 3.9%",
        },
        card: {
          DEFAULT: "0 0% 100%",
          foreground: "240 10% 3.9%",
        },
        border: "240 5.9% 90%",
        input: "240 5.9% 90%",
        ring: "240 5.9% 10%",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
