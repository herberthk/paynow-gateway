"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useEffect } from "react";

type Theme = "light" | "dark";

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "dark", // Default to dark mode
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === "light" ? "dark" : "light",
        })),
      setTheme: (theme: Theme) => set({ theme }),
    }),
    {
      name: "theme-storage",
      storage: createJSONStorage(() => localStorage),
      // Skip hydration on server
      skipHydration: true,
    },
  ),
);

// Hook to initialize theme on client side
export const useThemeInitializer = () => {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    // Rehydrate the store on client mount
    useThemeStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    // Update theme class when theme changes
    const root = window.document.documentElement;
    const currentTheme = root.classList.contains("dark") ? "dark" : "light";

    // Only update if theme actually changed
    if (currentTheme !== theme) {
      root.classList.remove("light", "dark");
      root.classList.add(theme);
    }
  }, [theme]);
};
