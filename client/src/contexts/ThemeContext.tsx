import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark" | "unicorn";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme?: () => void;
  switchable: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  switchable?: boolean;
}

export function ThemeProvider({
  children,
  defaultTheme = "light",
  switchable = false,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (switchable) {
      const stored = localStorage.getItem("theme");
      if (stored === "light" || stored === "dark" || stored === "unicorn") {
        return stored;
      }
      return defaultTheme;
    }
    return defaultTheme;
  });

  const isFirstRender = React.useRef(true);

  useEffect(() => {
    const root = document.documentElement;
    // Remove all potential theme classes
    root.classList.remove("light", "dark", "unicorn");
    // Add the current theme class
    root.classList.add(theme);

    if (switchable) {
      localStorage.setItem("theme", theme);
    }

    // Play sound effect on theme change (skip initial render)
    if (isFirstRender.current) {
      isFirstRender.current = false;
    } else {
      const audio = new Audio("/theme-switch.mp3");
      audio.volume = 0.4; // Set volume to a comfortable level
      audio.play().catch(e => console.error("Theme switch sound failed:", e));
    }
  }, [theme, switchable]);

  const setTheme = (newTheme: Theme) => {
    if (switchable) {
      setThemeState(newTheme);
    }
  };

  const toggleTheme = switchable
    ? () => {
        setThemeState(prev => {
          if (prev === "light") return "dark";
          if (prev === "dark") return "unicorn";
          return "light";
        });
      }
    : undefined;

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, switchable }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
