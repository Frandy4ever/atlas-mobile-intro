import React, { useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { Footprints, Archive, Shield } from "lucide-react-native";
import { useTheme } from "../context/ThemeContext";
import type { Activity } from "../context/ActivitiesContext";

interface ActivityItemProps {
  item: Activity;
  onDelete: (id: number) => void;
  onEdit: (item: Activity) => void;
  onArchive?: (item: Activity) => void;
  onSave?: (item: Activity) => void;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ 
  item, 
  onDelete, 
  onEdit, 
  onArchive, 
  onSave 
}) => {
  const { colors } = useTheme();
  const swipeableRef = useRef<Swipeable>(null);
  
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
        { 
          text: "Cancel", 
          style: "cancel",
          onPress: () => swipeableRef.current?.close()
        },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => {
            swipeableRef.current?.close();
            setTimeout(() => onDelete(item.id), 300);
          }
        }
      ]
    );
  };

  const handleArchive = () => {
    if (onArchive) {
      swipeableRef.current?.close();
      setTimeout(() => onArchive(item), 300);
    }
  };

  const handleLongPress = () => {
    if (onSave) {
      onSave(item);
    }
  };

  const renderRightActions = () => (
    <View style={styles.actionContainer}>
      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: '#ef4444' }]}
        onPress={handleDelete}
      >
        <Text style={styles.actionButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  const renderLeftActions = () => (
    <View style={styles.actionContainer}>
      {onArchive && (
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={handleArchive}
        >
          <Archive color="#fff" size={20} />
          <Text style={styles.actionButtonText}>Archive</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // Create dynamic styles
  const activityItemStyle = {
    backgroundColor: colors.cardBackground,
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  };

  const iconContainerStyle = {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.iconBackground,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginRight: 12,
  };

  const stepsTextStyle = {
    fontSize: 18,
    fontWeight: "600" as const,
    color: colors.text,
    marginBottom: 4,
  };

  const dateTextStyle = {
    fontSize: 14,
    color: colors.textSecondary,
  };

  const protectedTextStyle = {
    fontSize: 12,
    color: colors.primary,
    marginLeft: 4,
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      renderLeftActions={renderLeftActions}
      overshootLeft={false}
      overshootRight={false}
      friction={2}
      leftThreshold={40}
      rightThreshold={40}
    >
      <TouchableOpacity 
        style={activityItemStyle}
        onPress={() => onEdit(item)}
        onLongPress={handleLongPress}
        activeOpacity={0.7}
        delayLongPress={500}
      >
        <View style={styles.contentContainer}>
          <View style={iconContainerStyle}>
            <Footprints color={colors.primary} size={24} />
          </View>
          
          <View style={styles.textContent}>
            <Text style={stepsTextStyle}>
              {item.steps.toLocaleString()}
              <Text style={stepsTextStyle}> steps</Text>
            </Text>
            <Text style={dateTextStyle}>
              {formatDate(item.date)}
            </Text>
            {item.isProtected && (
              <View style={styles.protectedContainer}>
                <Shield size={12} color={colors.primary} />
                <Text style={protectedTextStyle}>Protected</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  textContent: {
    flex: 1,
    flexDirection: "column",
  },
  protectedContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  actionContainer: {
    height: '100%',
    justifyContent: 'center',
  },
  actionButton: {
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    height: '100%',
    borderRadius: 12,
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
    marginTop: 4,
  },
});

export default ActivityItem;