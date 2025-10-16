import React, { useState } from "react";
import { View, TextInput, Button, Alert, StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";
import { useActivities } from "../src/context/ActivitiesContext";

const AddScreen: React.FC = () => {
  const [steps, setSteps] = useState<string>("");
  const { addActivity } = useActivities();
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
            router.back(); // Navigate back to home screen
          },
        },
      ]);
    } catch (err) {
      Alert.alert("Error", "Failed to add activity. Please try again.");
      console.error(err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Number of Steps:</Text>
      <TextInput
        placeholder="Enter steps (e.g., 5000)"
        value={steps}
        onChangeText={setSteps}
        keyboardType="numeric"
        style={styles.input}
      />
      <Button title="Add Activity" onPress={handleAdd} disabled={!steps} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 20,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
});

export default AddScreen;