import React, { useState } from "react";
import { View, TextInput, Alert, StyleSheet, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useActivities } from "../src/context/ActivitiesContext";
import { useTheme } from "../src/context/ThemeContext";

const AddScreen: React.FC = () => {
  const [steps, setSteps] = useState<string>("");
  const { addActivity } = useActivities();
  const { colors } = useTheme();
  const router = useRouter();

  const handleAdd = async () => {
    const num = parseInt(steps, 10);
    if (isNaN(num) || num < 0) {
      return Alert.alert("Error", "Please enter a valid number of steps (0 or greater)");
    }
    
    try {
      await addActivity(num);
      Alert.alert("Success", "Activity added successfully!", [
        {
          text: "OK",
          onPress: () => {
            setSteps("");
            router.back();
          },
        },
      ]);
    } catch (err) {
      Alert.alert("Error", "Failed to add activity. Please try again.");
      console.error(err);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: colors.background,
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
      marginBottom: 20,
      padding: 12,
      borderRadius: 8,
      fontSize: 16,
      backgroundColor: colors.inputBackground,
      color: colors.text,
    },
    button: {
      backgroundColor: colors.primary,
      padding: 16,
      borderRadius: 8,
      alignItems: "center",
      opacity: !steps ? 0.5 : 1,
    },
    buttonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "600",
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Number of Steps:</Text>
      <TextInput
        placeholder="Enter steps (e.g., 5000)"
        placeholderTextColor={colors.textSecondary}
        value={steps}
        onChangeText={setSteps}
        keyboardType="numeric"
        style={styles.input}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={handleAdd}
        disabled={!steps}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonText}>Add Activity</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AddScreen;