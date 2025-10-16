import React, { createContext, useContext, useState, useEffect } from "react";
import { useColorScheme } from "react-native";

export type Theme = "light" | "dark";

export const lightColors = {
  background: "#f5f5f5",
  cardBackground: "#fff",
  text: "#1a1a1a",
  textSecondary: "#666",
  primary: "#007AFF",
  danger: "#FF3B30",
  border: "#ddd",
  inputBackground: "#fff",
  shadow: "#000",
  iconBackground: "#E8F5E9",
};

export const darkColors = {
  background: "#000",
  cardBackground: "#1c1c1e",
  text: "#fff",
  textSecondary: "#8e8e93",
  primary: "#0A84FF",
  danger: "#FF453A",
  border: "#38383a",
  inputBackground: "#1c1c1e",
  shadow: "#000",
  iconBackground: "#1e3a1e",
};

interface ThemeContextType {
  theme: Theme;
  colors: typeof lightColors;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState<Theme>(systemColorScheme === "dark" ? "dark" : "light");

  const colors = theme === "dark" ? darkColors : lightColors;
  const isDark = theme === "dark";

  const toggleTheme = () => {
    setTheme(prev => prev === "light" ? "dark" : "light");
  };

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};