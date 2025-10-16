import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import type { Activity } from "../context/ActivitiesContext";

interface EditModalProps {
  visible: boolean;
  activity: Activity | null;
  onClose: () => void;
  onSave: (id: number, steps: number) => void;
}

const EditModal: React.FC<EditModalProps> = ({ visible, activity, onClose, onSave }) => {
  const { colors } = useTheme();
  const [steps, setSteps] = useState<string>("");

  useEffect(() => {
    if (activity) {
      setSteps(activity.steps.toString());
    }
  }, [activity]);

  const handleSave = () => {
    if (!activity) return;
    
    const num = parseInt(steps, 10);
    if (isNaN(num) || num < 0) {
      return;
    }
    
    onSave(activity.id, num);
    onClose();
  };

  if (!activity) return null;

  const dynamicStyles = StyleSheet.create({
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
    },
    label: {
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 8,
      color: colors.text,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      marginBottom: 20,
      backgroundColor: colors.inputBackground,
      color: colors.text,
    },
    cancelButton: {
      backgroundColor: colors.border,
    },
    cancelButtonText: {
      color: colors.text,
      fontWeight: "600",
      fontSize: 16,
    },
    saveButton: {
      backgroundColor: colors.primary,
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.overlay}
      >
        <View style={dynamicStyles.modalContainer}>
          <Text style={dynamicStyles.title}>Edit Activity</Text>
          
          <Text style={dynamicStyles.label}>Steps:</Text>
          <TextInput
            style={dynamicStyles.input}
            value={steps}
            onChangeText={setSteps}
            keyboardType="numeric"
            placeholder="Enter steps"
            placeholderTextColor={colors.textSecondary}
            autoFocus
          />
          
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, dynamicStyles.cancelButton]}
              onPress={onClose}
            >
              <Text style={dynamicStyles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, dynamicStyles.saveButton]}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default EditModal;