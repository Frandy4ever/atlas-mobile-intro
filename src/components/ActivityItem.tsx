import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { useTheme } from "../context/ThemeContext";
import type { Activity } from "../context/ActivitiesContext";

interface ActivityItemProps {
  item: Activity;
  onDelete: (id: number) => void;
  onEdit: (item: Activity) => void;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ item, onDelete, onEdit }) => {
  const { colors } = useTheme();
  
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Activity",
      "Are you sure you want to delete this activity?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => onDelete(item.id)
        }
      ]
    );
  };

  const renderRightActions = () => (
    <TouchableOpacity
      style={[styles.deleteButton, { backgroundColor: colors.danger }]}
      onPress={handleDelete}
    >
      <Text style={styles.deleteButtonText}>Delete</Text>
    </TouchableOpacity>
  );

  const dynamicStyles = StyleSheet.create({
    activityItem: {
      backgroundColor: colors.cardBackground,
      marginBottom: 8,
      borderRadius: 12,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.iconBackground,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    stepsText: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 4,
    },
    dateText: {
      fontSize: 14,
      color: colors.textSecondary,
    },
  });

  return (
    <Swipeable renderRightActions={renderRightActions}>
      <TouchableOpacity 
        style={dynamicStyles.activityItem}
        onPress={() => onEdit(item)}
        activeOpacity={0.7}
      >
        <View style={styles.contentRow}>
          <View style={dynamicStyles.iconContainer}>
            <Text style={styles.iconText}>👟</Text>
          </View>
          <View style={styles.textContainer}>
            <Text style={dynamicStyles.stepsText}>{item.steps.toLocaleString()} steps</Text>
            <Text style={dynamicStyles.dateText}>{formatDate(item.date)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  iconText: {
    fontSize: 24,
  },
  textContainer: {
    flex: 1,
  },
  deleteButton: {
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    marginBottom: 8,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});

export default ActivityItem;