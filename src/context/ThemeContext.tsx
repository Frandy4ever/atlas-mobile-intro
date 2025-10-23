import React, { createContext, useContext, useState, useEffect } from "react";
import { useColorScheme } from "react-native";

export type Theme = "light" | "dark" | "warm" | "cyberberry" | "stargazer";

export const lightColors = {
  background: "#fafafa",
  cardBackground: "#ffffff",
  text: "#020617",
  textSecondary: "#64748b",
  primary: "#10b981", // green
  secondary: "#3b82f6", // blue
  danger: "#b91c1c", // delete buttons
  border: "#e2e8f0",
  inputBackground: "#ffffff",
  shadow: "#000000",
  iconBackground: "#f1f5f9",
};

export const darkColors = {
  background: "#020617",
  cardBackground: "#0f172a",
  text: "#f8fafc",
  textSecondary: "#94a3b8",
  primary: "#10b981", // green
  secondary: "#3b82f6", // blue
  danger: "#b91c1c", // delete buttons
  border: "#334155",
  inputBackground: "#1e293b",
  shadow: "#000000",
  iconBackground: "#1e293b",
};

export const warmColors = {
  background: "#fef3c7",
  cardBackground: "#fef7cd",
  text: "#451a03",
  textSecondary: "#92400e",
  primary: "#10b981", // green
  secondary: "#3b82f6", // blue
  danger: "#b91c1c", // delete buttons
  border: "#fcd34d",
  inputBackground: "#fefce8",
  shadow: "#000000",
  iconBackground: "#fef3c7",
};

export const cyberberryColors = {
  background: "#fdf4ff",
  cardBackground: "#faf5ff",
  text: "#3b0764",
  textSecondary: "#7e22ce",
  primary: "#d946ef", // cyberberry
  secondary: "#3b82f6", // blue
  danger: "#b91c1c", // delete buttons
  border: "#e9d5ff",
  inputBackground: "#faf5ff",
  shadow: "#000000",
  iconBackground: "#f3e8ff",
};

export const stargazerColors = {
  background: "#f0f9ff",
  cardBackground: "#e0f2fe",
  text: "#0c4a6e",
  textSecondary: "#0369a1",
  primary: "#0ea5e9",
  secondary: "#3b82f6", // blue
  danger: "#b91c1c", // delete buttons
  border: "#bae6fd",
  inputBackground: "#f0f9ff",
  shadow: "#000000",
  iconBackground: "#e0f2fe",
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

  const getColors = () => {
    switch (theme) {
      case "dark":
        return darkColors;
      case "warm":
        return warmColors;
      case "cyberberry":
        return cyberberryColors;
      case "stargazer":
        return stargazerColors;
      default:
        return lightColors;
    }
  };

  const colors = getColors();
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