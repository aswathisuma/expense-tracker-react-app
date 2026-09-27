import { useCallback, useEffect, useMemo } from "react";
import { ThemeContext } from "./ThemeContext";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { STORAGE_KEYS } from "../constants/storageKeys";

const THEMES = ["light", "dark"];

function getSystemTheme() {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

function isValidTheme(value) {
  return THEMES.includes(value);
}

export function ThemeProvider({ children }) {
  // Phase 1 used useState here. Swapping it for useLocalStorage is all it takes
  // to make the theme survive a page refresh.
  const [theme, setTheme] = useLocalStorage(STORAGE_KEYS.THEME, getSystemTheme(), isValidTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((currentTheme) => (currentTheme === "light" ? "dark" : "light"));
  }, [setTheme]);

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
