import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Sun, Moon, Palette } from "lucide-react-native";
import { useTheme, type Theme } from "../context/ThemeContext";

interface ThemeSelectorProps {
  visible: boolean;
  onClose: () => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ visible, onClose }) => {
  const { colors, theme, setTheme } = useTheme();

  const handleThemeSelect = (selectedTheme: Theme) => {
    setTheme(selectedTheme);
    onClose();
  };

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContainer: {
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      padding: 24,
      width: "85%",
      maxWidth: 400,
    },
    title: {
      fontSize: 22,
      fontWeight: "700",
      marginBottom: 20,
      color: colors.text,
      textAlign: "center",
    },
    themeOption: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
      borderWidth: 2,
      borderColor: "transparent",
    },
    themeOptionSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.background,
    },
    themeIcon: {
      marginRight: 12,
    },
    themeInfo: {
      flex: 1,
    },
    themeName: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 2,
    },
    themeDescription: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    closeButton: {
      marginTop: 8,
      padding: 12,
      borderRadius: 8,
      backgroundColor: colors.border,
      alignItems: "center",
    },
    closeButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
    },
  });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Select Theme</Text>

          <TouchableOpacity
            style={[styles.themeOption, theme === "light" && styles.themeOptionSelected]}
            onPress={() => handleThemeSelect("light")}
          >
            <Sun color={colors.text} size={24} style={styles.themeIcon} />
            <View style={styles.themeInfo}>
              <Text style={styles.themeName}>Light</Text>
              <Text style={styles.themeDescription}>Bright and clean</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.themeOption, theme === "dark" && styles.themeOptionSelected]}
            onPress={() => handleThemeSelect("dark")}
          >
            <Moon color={colors.text} size={24} style={styles.themeIcon} />
            <View style={styles.themeInfo}>
              <Text style={styles.themeName}>Dark</Text>
              <Text style={styles.themeDescription}>Easy on the eyes</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.themeOption, theme === "warm" && styles.themeOptionSelected]}
            onPress={() => handleThemeSelect("warm")}
          >
            <Palette color={colors.text} size={24} style={styles.themeIcon} />
            <View style={styles.themeInfo}>
              <Text style={styles.themeName}>Warm</Text>
              <Text style={styles.themeDescription}>Cozy and inviting</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ThemeSelector;