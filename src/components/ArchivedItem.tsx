import React, { useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { Footprints, RotateCcw } from "lucide-react-native";
import { useTheme } from "../context/ThemeContext";
import type { ArchivedActivity } from "../context/ArchiveContext";

interface ArchiveItemProps {
  item: ArchivedActivity;
  onRestore: (item: ArchivedActivity) => void;
  onDelete: (id: number) => void;
  onSave?: (item: ArchivedActivity) => void; // New prop for saving activity
}

const ArchiveItem: React.FC<ArchiveItemProps> = ({ item, onRestore, onDelete, onSave }) => {
  const { colors } = useTheme();
  const swipeableRef = useRef<Swipeable>(null);
  
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleRestore = () => {
    Alert.alert(
      "Restore Activity",
      "Are you sure you want to restore this activity?",
      [
        { 
          text: "Cancel", 
          style: "cancel",
          onPress: () => {
            swipeableRef.current?.close();
          }
        },
        { 
          text: "Restore", 
          style: "default",
          onPress: () => {
            swipeableRef.current?.close();
            setTimeout(() => onRestore(item), 300);
          }
        }
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Archived Activity",
      "Are you sure you want to permanently delete this archived activity?",
      [
        { 
          text: "Cancel", 
          style: "cancel",
          onPress: () => {
            swipeableRef.current?.close();
          }
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

  const handleLongPress = () => {
    if (onSave) {
      onSave(item);
    }
  };

  const renderRightActions = () => (
    <TouchableOpacity
      style={[styles.deleteButton, { backgroundColor: colors.danger }]}
      onPress={handleDelete}
    >
      <Text style={styles.deleteButtonText}>Delete</Text>
    </TouchableOpacity>
  );

  const renderLeftActions = () => (
    <TouchableOpacity
      style={[styles.restoreButton, { backgroundColor: colors.primary }]}
      onPress={handleRestore}
    >
      <RotateCcw color="#fff" size={20} />
      <Text style={styles.restoreButtonText}>Restore</Text>
    </TouchableOpacity>
  );

  const dynamicStyles = StyleSheet.create({
    archiveItem: {
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
        style={dynamicStyles.archiveItem}
        onLongPress={handleLongPress}
        activeOpacity={0.7}
        delayLongPress={500} // 500ms long press
      >
        <View style={styles.contentRow}>
          <View style={dynamicStyles.iconContainer}>
            <Footprints color={colors.primary} size={24} />
          </View>
          <View style={styles.textContainer}>
            <Text style={dynamicStyles.stepsText}>{item.steps.toLocaleString()} steps</Text>
            <Text style={dynamicStyles.dateText}>{formatDate(item.date)}</Text>
            <Text style={[dynamicStyles.dateText, { fontSize: 12 }]}>
              Archived: {formatDate(item.archivedAt)}
            </Text>
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
  restoreButton: {
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    marginBottom: 8,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    gap: 4,
  },
  restoreButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
  },
});

export default ArchiveItem;