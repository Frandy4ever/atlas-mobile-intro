import React from "react";
import { View, Text, StyleSheet, Alert, TouchableOpacity } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useArchive } from "../src/context/ArchiveContext";
import { useActivities } from "../src/context/ActivitiesContext";
import { useTheme } from "../src/context/ThemeContext";
import LoadingSkeleton from "../src/components/LoadingSkeleton";
import ArchiveItem from "../src/components/ArchivedItem";
import type { ArchivedActivity } from "../src/context/ArchiveContext";

const ArchiveScreen: React.FC = () => {
  const { archivedActivities, loading, deleteArchivedActivity, deleteAllArchived, unarchiveActivity } = useArchive();
  const { addActivity, protectActivity, activities } = useActivities();
  const { colors } = useTheme();

  const handleRestore = async (item: ArchivedActivity) => {
    try {
      // Add the activity back to main activities with original date
      await addActivity(item.steps, item.date);
      // Remove from archive using the unarchiveActivity method
      await unarchiveActivity(item.id);
      Alert.alert("Success", "Activity restored successfully!");
    } catch (error) {
      console.error("Restore error:", error);
      Alert.alert("Error", "Failed to restore activity");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteArchivedActivity(id);
    } catch (error) {
      console.error("Delete error:", error);
      Alert.alert("Error", "Failed to delete archived activity");
    }
  };

  const handleSaveActivity = async (item: ArchivedActivity) => {
    Alert.alert(
      "Save Activity",
      "This will restore the activity and mark it as protected from bulk deletion.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Save",
          style: "default",
          onPress: async () => {
            try {
              // First restore the activity
              await addActivity(item.steps, item.date);
              
              // Wait a moment for the activity to be added
              setTimeout(async () => {
                try {
                  // Find the newly added activity by matching steps and date
                  const newActivity = activities.find(
                    act => act.steps === item.steps && act.date === item.date
                  );
                  
                  if (newActivity) {
                    // Protect it
                    await protectActivity(newActivity.id);
                    // Remove from archive
                    await unarchiveActivity(item.id);
                    Alert.alert("Success", "Activity saved and protected!");
                  } else {
                    Alert.alert("Error", "Could not find restored activity to protect");
                  }
                } catch (err) {
                  console.error("Protection error:", err);
                  Alert.alert("Error", "Activity restored but failed to protect");
                }
              }, 500);
            } catch (err) {
              console.error("Save error:", err);
              Alert.alert("Error", "Failed to save activity");
            }
          },
        },
      ]
    );
  };

  const handleRestoreAll = () => {
    if (archivedActivities.length === 0) return;
    
    Alert.alert(
      "Restore All Activities",
      `Are you sure you want to restore all ${archivedActivities.length} archived activities?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Restore All",
          style: "default",
          onPress: async () => {
            try {
              // Restore all activities
              for (const item of archivedActivities) {
                await addActivity(item.steps, item.date);
                await unarchiveActivity(item.id);
              }
              Alert.alert("Success", "All activities restored successfully!");
            } catch (error) {
              console.error("Restore all error:", error);
              Alert.alert("Error", "Failed to restore all activities");
            }
          },
        },
      ]
    );
  };

  const handleDeleteAll = () => {
    if (archivedActivities.length === 0) return;
    
    Alert.alert(
      "Delete All Archived Activities",
      `Are you sure you want to permanently delete all ${archivedActivities.length} archived activities? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAllArchived();
              Alert.alert("Success", "All archived activities deleted");
            } catch (error) {
              console.error("Delete all error:", error);
              Alert.alert("Error", "Failed to delete all archived activities");
            }
          },
        },
      ]
    );
  };

  const stats = {
    totalSteps: archivedActivities.reduce((sum, act) => sum + act.steps, 0),
    avgSteps: archivedActivities.length > 0 ? Math.round(archivedActivities.reduce((sum, act) => sum + act.steps, 0) / archivedActivities.length) : 0,
    count: archivedActivities.length
  };

  const renderItem = ({ item }: { item: ArchivedActivity }) => (
    <ArchiveItem
      item={item}
      onRestore={handleRestore}
      onDelete={handleDelete}
      onSave={handleSaveActivity}
    />
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    statsContainer: {
      flexDirection: "row",
      padding: 16,
      gap: 12,
    },
    statBox: {
      flex: 1,
      backgroundColor: colors.cardBackground,
      padding: 16,
      borderRadius: 12,
      alignItems: "center",
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    statValue: {
      fontSize: 24,
      fontWeight: "700",
      color: colors.primary,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: "center",
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 32,
    },
    emptyText: {
      fontSize: 20,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 8,
    },
    emptySubtext: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: "center",
    },
    listContainer: {
      flex: 1,
      paddingHorizontal: 16,
    },
    buttonContainer: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.background,
    },
    actionButton: {
      padding: 16,
      borderRadius: 8,
      alignItems: "center",
    },
    restoreAllButton: {
      backgroundColor: colors.primary,
    },
    deleteAllButton: {
      backgroundColor: colors.danger,
    },
    buttonText: {
      color: "#fff",
      fontWeight: "600",
      fontSize: 16,
    },
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <LoadingSkeleton count={5} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Stats Header */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.totalSteps.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Total Steps</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.avgSteps.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Avg Steps</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.count}</Text>
          <Text style={styles.statLabel}>Activities</Text>
        </View>
      </View>

      {/* Activities List */}
      {archivedActivities.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No archived activities</Text>
          <Text style={styles.emptySubtext}>
            Activities you archive will appear here
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.listContainer}>
            <FlashList
              data={archivedActivities}
              renderItem={renderItem}
              estimatedItemSize={80}
              keyExtractor={(item) => item.id.toString()}
            />
          </View>

          {/* Bottom Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.restoreAllButton]}
              onPress={handleRestoreAll}
            >
              <Text style={styles.buttonText}>Restore All Activities</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteAllButton]}
              onPress={handleDeleteAll}
            >
              <Text style={styles.buttonText}>Delete All Archived</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

export default ArchiveScreen;