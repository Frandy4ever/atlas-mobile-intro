import React, { useState, useMemo, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { FlashList, type ListRenderItem } from "@shopify/flash-list";
import { useActivities } from "../src/context/ActivitiesContext";
import { useArchive } from "../src/context/ArchiveContext";
import { useTheme } from "../src/context/ThemeContext";
import { useAuth } from "../src/context/AuthContext";
import type { Activity } from "../src/context/ActivitiesContext";
import ActivityItem from "../src/components/ActivityItem";
import EditModal from "../src/components/EditModal";
import LoadingSkeleton from "../src/components/LoadingSkeleton";

const HomeScreen: React.FC = () => {
  const { activities, loading, deleteActivity, deleteAllUnprotected, updateActivity, protectActivity } = useActivities();
  const { archiveActivity } = useArchive();
  const { colors } = useTheme();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading...</Text>
      </View>
    );
  }

  // If not authenticated, show loading (redirect will happen)
  if (!isAuthenticated) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Helper function to count occurrences of a digit in a string
  const countOccurrences = (str: string, digit: string): number => {
    const regex = new RegExp(digit, 'g');
    const matches = str.match(regex);
    return matches ? matches.length : 0;
  };

  // Filter activities based on search with frequency + position hybrid
  const filteredActivities = useMemo(() => {
    const trimmed = searchQuery.trim();
    if (trimmed.length === 0) return activities;
    
    const query = trimmed.toLowerCase();
    
    // Check if query is numeric
    const isNumericQuery = /^\d+$/.test(query);
    
    if (isNumericQuery) {
      // For numeric queries, use frequency + position hybrid sorting
      const filtered = activities.filter(activity => {
        const stepsStr = activity.steps.toString();
        return stepsStr.includes(query);
      });
      
      return filtered.sort((a, b) => {
        const aStr = a.steps.toString();
        const bStr = b.steps.toString();
        
        // Count occurrences of the search digit
        const aCount = countOccurrences(aStr, query);
        const bCount = countOccurrences(bStr, query);
        
        // Primary sort: frequency (higher count first)
        if (bCount !== aCount) {
          return bCount - aCount;
        }
        
        // Secondary sort: earliest position (lower index first)
        const aIndex = aStr.indexOf(query);
        const bIndex = bStr.indexOf(query);
        
        if (aIndex !== bIndex) {
          return aIndex - bIndex;
        }
        
        // Tertiary sort: preserve original order (by date)
        return a.date - b.date;
      });
    } else {
      // For non-numeric queries, filter by steps or date
      return activities.filter(activity => {
        const stepsMatch = activity.steps.toString().includes(query);
        const date = new Date(activity.date * 1000);
        const dateStr = date.toLocaleDateString().toLowerCase();
        const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase();
        const dateMatch = dateStr.includes(query) || timeStr.includes(query);
        return stepsMatch || dateMatch;
      });
    }
  }, [activities, searchQuery]);

  const stats = useMemo(() => {
    const totalSteps = activities.reduce((sum, act) => sum + act.steps, 0);
    const avgSteps = activities.length > 0 ? Math.round(totalSteps / activities.length) : 0;
    return { totalSteps, avgSteps, count: activities.length };
  }, [activities]);

  const handleDeleteAll = () => {
    const isFiltered = searchQuery.trim().length > 0;
    const itemCount = filteredActivities.length;
    
    Alert.alert(
      isFiltered ? "Delete Search Results" : "Delete All Activities",
      isFiltered 
        ? `Are you sure you want to delete all ${itemCount} search result${itemCount !== 1 ? 's' : ''}? This will only delete unprotected activities.`
        : "Are you sure you want to delete all unprotected activities? Protected activities will be preserved.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All",
          style: "destructive",
          onPress: async () => {
            try {
              if (isFiltered) {
                // Delete only filtered unprotected activities
                for (const activity of filteredActivities) {
                  if (!activity.isProtected) {
                    await deleteActivity(activity.id);
                  }
                }
              } else {
                // Delete all unprotected activities
                await deleteAllUnprotected();
              }
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

  const handleArchive = async (activity: Activity) => {
    try {
      await archiveActivity(activity.id, activity.steps, activity.date);
      await deleteActivity(activity.id);
      Alert.alert("Success", "Activity archived successfully!");
    } catch (err) {
      Alert.alert("Error", "Failed to archive activity");
    }
  };

  const handleSaveActivity = (activity: Activity) => {
    Alert.alert(
      "Save Activity",
      "Do you want to protect this activity from being deleted by the 'Delete All' button?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Save",
          style: "default",
          onPress: async () => {
            try {
              await protectActivity(activity.id);
              Alert.alert("Success", "Activity saved and protected!");
            } catch (err) {
              Alert.alert("Error", "Failed to save activity");
            }
          },
        },
      ]
    );
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
      onArchive={handleArchive}
      onSave={handleSaveActivity}
    />
  );

  return (
    <View style={[styles.mainContainer, { backgroundColor: colors.background }]}>
      {/* Header with Stats */}
      <View style={styles.statsContainer}>
        <View style={[styles.statBox, { backgroundColor: colors.cardBackground, shadowColor: colors.shadow }]}>
          <Text style={[styles.statValue, { color: colors.primary }]}>{stats.totalSteps.toLocaleString()}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Steps</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: colors.cardBackground, shadowColor: colors.shadow }]}>
          <Text style={[styles.statValue, { color: colors.primary }]}>{stats.avgSteps.toLocaleString()}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Avg Steps</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: colors.cardBackground, shadowColor: colors.shadow }]}>
          <Text style={[styles.statValue, { color: colors.primary }]}>{stats.count}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Activities</Text>
        </View>
      </View>

      {/* Search Bar */}
      <TextInput
        style={[styles.searchInput, { 
          backgroundColor: colors.inputBackground, 
          borderColor: colors.border, 
          color: colors.text 
        }]}
        placeholder="Search by steps or date..."
        placeholderTextColor={colors.textSecondary}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Search Info */}
      {searchQuery.trim().length > 0 && /^\d+$/.test(searchQuery.trim()) && (
        <Text style={[styles.searchInfo, { color: colors.textSecondary }]}>
          Showing results with most "{searchQuery}" digits first
        </Text>
      )}

      {/* Activities List */}
      {loading ? (
        <LoadingSkeleton count={5} />
      ) : filteredActivities.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.text }]}>
            {searchQuery ? "No activities found" : "No activities yet"}
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
            {searchQuery ? "Try a different search" : "Add your first activity to get started!"}
          </Text>
        </View>
      ) : (
        <View style={styles.listContainer}>
          <FlashList<Activity>
            data={filteredActivities}
            renderItem={renderItem}
            estimatedItemSize={80}
            keyExtractor={(item) => item.id.toString()}
          />
        </View>
      )}

      {/* Bottom Buttons */}
      <View style={[styles.buttonContainer, { 
        backgroundColor: colors.background, 
        borderTopColor: colors.border 
      }]}>
        <TouchableOpacity
          style={[styles.actionButton, styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push("/add")}
        >
          <Text style={styles.addButtonText}>+ Add Activity</Text>
        </TouchableOpacity>
        
        {filteredActivities.length > 0 && (
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteAllButton, { backgroundColor: colors.danger }]}
            onPress={handleDeleteAll}
          >
            <Text style={styles.deleteAllButtonText}>
              {searchQuery.trim().length > 0 ? "Delete Search Results" : "Delete All Unprotected"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  mainContainer: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  statBox: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: "center",
  },
  searchInput: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
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
  },
  actionButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  addButton: {},
  deleteAllButton: {},
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  deleteAllButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
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
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    textAlign: "center",
  },
  searchInfo: {
    marginHorizontal: 16,
    marginBottom: 8,
    fontSize: 12,
    textAlign: "center",
  },
});

export default HomeScreen;