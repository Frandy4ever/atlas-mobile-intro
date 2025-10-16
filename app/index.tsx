import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert } from "react-native";
import { useRouter } from "expo-router";
import { FlashList, type ListRenderItem } from "@shopify/flash-list";
import { useActivities } from "../src/context/ActivitiesContext";
import type { Activity } from "../src/context/ActivitiesContext";
import ActivityItem from "../src/components/ActivityItem";
import EditModal from "../src/components/EditModal";

const HomeScreen: React.FC = () => {
  const { activities, loading, deleteActivity, deleteAllActivities, updateActivity } = useActivities();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  // Filter activities based on search
  const filteredActivities = useMemo(() => {
    if (!searchQuery.trim()) return activities;
    
    const query = searchQuery.toLowerCase();
    return activities.filter(activity => {
      const stepsMatch = activity.steps.toString().includes(query);
      const dateMatch = new Date(activity.date * 1000)
        .toLocaleDateString()
        .toLowerCase()
        .includes(query);
      return stepsMatch || dateMatch;
    });
  }, [activities, searchQuery]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalSteps = activities.reduce((sum, act) => sum + act.steps, 0);
    const avgSteps = activities.length > 0 ? Math.round(totalSteps / activities.length) : 0;
    return { totalSteps, avgSteps, count: activities.length };
  }, [activities]);

  const handleDeleteAll = () => {
    Alert.alert(
      "Delete All Activities",
      "Are you sure you want to delete all activities? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAllActivities();
            } catch (err) {
              Alert.alert("Error", "Failed to delete activities");
            }
          },
        },
      ]
    );
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteActivity(id);
    } catch (err) {
      Alert.alert("Error", "Failed to delete activity");
    }
  };

  const handleEdit = (activity: Activity) => {
    setEditingActivity(activity);
  };

  const handleSaveEdit = async (id: number, steps: number) => {
    try {
      await updateActivity(id, steps);
    } catch (err) {
      Alert.alert("Error", "Failed to update activity");
    }
  };

  const renderItem: ListRenderItem<Activity> = ({ item }) => (
    <ActivityItem
      item={item}
      onDelete={handleDelete}
      onEdit={handleEdit}
    />
  );

  return (
    <View style={styles.container}>
      {/* Header with Stats */}
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

      {/* Search Bar */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search by steps or date..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Action Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.actionButton, styles.addButton]}
          onPress={() => router.push("/add")}
        >
          <Text style={styles.addButtonText}>+ Add Activity</Text>
        </TouchableOpacity>
        
        {activities.length > 0 && (
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteAllButton]}
            onPress={handleDeleteAll}
          >
            <Text style={styles.deleteAllButtonText}>Delete All</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Activities List */}
      {loading ? (
        <Text style={styles.message}>Loading...</Text>
      ) : filteredActivities.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {searchQuery ? "No activities found" : "No activities yet"}
          </Text>
          <Text style={styles.emptySubtext}>
            {searchQuery ? "Try a different search" : "Add your first activity to get started!"}
          </Text>
        </View>
      ) : (
        <View style={styles.listContainer}>
          
          <FlashList<Activity>
            data={filteredActivities}
            renderItem={renderItem}
            estimatedItemSize={80}
          />
        </View>
      )}

      {/* Edit Modal */}
      <EditModal
        visible={editingActivity !== null}
        activity={editingActivity}
        onClose={() => setEditingActivity(null)}
        onSave={handleSaveEdit}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  statsContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#007AFF",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  searchInput: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  buttonRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  addButton: {
    backgroundColor: "#007AFF",
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  deleteAllButton: {
    backgroundColor: "#FF3B30",
  },
  deleteAllButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  message: {
    marginTop: 40,
    fontSize: 16,
    textAlign: "center",
    color: "#666",
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
    color: "#333",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
});

export default HomeScreen;