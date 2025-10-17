import React, { createContext, useContext, useState, useEffect } from "react";
import { useColorScheme } from "react-native";

export type Theme = "light" | "dark" | "warm";

export const lightColors = {
  background: "#f5f5f5",
  cardBackground: "#fff",
  text: "#1a1a1a",
  textSecondary: "#666",
  primary: "#1ed2af",
  danger: "#d00414",
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
  primary: "#1ed2af",
  danger: "#d00414",
  border: "#38383a",
  inputBackground: "#1c1c1e",
  shadow: "#000",
  iconBackground: "#1e3a1e",
};

export const warmColors = {
  background: "#fef9e6",
  cardBackground: "#fff9e6",
  text: "#3a3a2a",
  textSecondary: "#8a8a7a",
  primary: "#1ed2af",
  danger: "#d00414",
  border: "#e8e0c8",
  inputBackground: "#fffdf5",
  shadow: "#000",
  iconBackground: "#f0ecd8",
  
};

interface ThemeContextType {
  theme: Theme;
  colors: typeof lightColors;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState<Theme>(systemColorScheme === "dark" ? "dark" : "light");

  const colors = theme === "dark" ? darkColors : theme === "warm" ? warmColors : lightColors;
  const isDark = theme === "dark";

  return (
    <ThemeContext.Provider value={{ theme, colors, setTheme, isDark }}>
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