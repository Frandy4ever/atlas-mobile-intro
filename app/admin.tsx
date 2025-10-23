import React, { useState, useEffect, useMemo, JSX } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  DimensionValue,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../src/context/AuthContext";
import { useActivities } from "../src/context/ActivitiesContext";
import { useTheme } from "../src/context/ThemeContext";
import { Search, User, Mail, Calendar, Trash2, Eye, Key, AlertCircle } from "lucide-react-native";
import { User as UserType, PasswordResetRequest } from "../src/types/auth";

interface UserStats {
  totalSteps: number;
  avgSteps: number;
  activityCount: number;
  maxSteps: number;
  minSteps: number;
  skippedDays: number;
}

export default function AdminDashboard() {
  const { users, getAllUsers, deleteUser, passwordResetRequests, approvePasswordReset, getPendingResetRequests, hasPendingResetRequests } = useAuth();
  const { getActivitiesByUserId } = useActivities();
  const { colors } = useTheme();
  const router = useRouter();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [userStats, setUserStats] = useState<Record<number, UserStats>>({});
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"firstName" | "email" | "totalSteps" | "avgSteps" | "skippedDays">("firstName");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [resetRequests, setResetRequests] = useState<PasswordResetRequest[]>([]);

  useEffect(() => {
    loadUsersAndStats();
    loadResetRequests();
  }, []);

  const loadUsersAndStats = async () => {
    setLoading(true);
    try {
      await getAllUsers();
    } catch (error) {
      Alert.alert("Error", "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const loadResetRequests = async () => {
    const requests = await getPendingResetRequests();
    setResetRequests(requests);
  };

  // Calculate stats for each user
  useEffect(() => {
    const calculateStats = async () => {
      const stats: Record<number, UserStats> = {};
      
      for (const user of users) {
        if (user.isAdmin) continue; // Skip admin users for stats
        
        const activities = await getActivitiesByUserId(user.id);
        
        if (activities.length === 0) {
          stats[user.id] = {
            totalSteps: 0,
            avgSteps: 0,
            activityCount: 0,
            maxSteps: 0,
            minSteps: 0,
            skippedDays: 0,
          };
          continue;
        }

        const totalSteps = activities.reduce((sum, act) => sum + act.steps, 0);
        const avgSteps = Math.round(totalSteps / activities.length);
        const maxSteps = Math.max(...activities.map(act => act.steps));
        const minSteps = Math.min(...activities.map(act => act.steps));
        
        // Calculate skipped days (days with no activities in the last 30 days)
        const thirtyDaysAgo = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60);
        const recentActivities = activities.filter(act => act.date >= thirtyDaysAgo);
        const activityDays = new Set(recentActivities.map(act => {
          const date = new Date(act.date * 1000);
          return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        })).size;
        
        const skippedDays = Math.max(0, 30 - activityDays);

        stats[user.id] = {
          totalSteps,
          avgSteps,
          activityCount: activities.length,
          maxSteps,
          minSteps,
          skippedDays,
        };
      }
      
      setUserStats(stats);
    };

    if (users.length > 0) {
      calculateStats();
    }
  }, [users, getActivitiesByUserId]);

  const filteredUsers = useMemo(() => {
    let filtered = users.filter((user: UserType) => 
      !user.isAdmin && (
        user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );

    // Sort users
    filtered.sort((a: UserType, b: UserType) => {
      let aValue: any;
      let bValue: any;

      if (sortBy === "totalSteps" || sortBy === "avgSteps" || sortBy === "skippedDays") {
        aValue = userStats[a.id]?.[sortBy] || 0;
        bValue = userStats[b.id]?.[sortBy] || 0;
      } else if (sortBy === "firstName") {
        // Sort by full name (firstName + lastName)
        aValue = `${a.firstName} ${a.lastName}`.toLowerCase();
        bValue = `${b.firstName} ${b.lastName}`.toLowerCase();
      } else {
        // For email and other direct properties
        aValue = a[sortBy].toLowerCase();
        bValue = b[sortBy].toLowerCase();
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [users, searchQuery, sortBy, sortOrder, userStats]);

  const handleUserPress = (userId: number) => {
    router.push(`/user-stats/${userId}` as any);
  };

  const handleDeleteUser = (user: UserType) => {
    Alert.alert(
      "Delete User",
      `Are you sure you want to delete ${user.firstName} ${user.lastName}'s account? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const success = await deleteUser(user.id);
            if (success) {
              loadUsersAndStats();
            }
          },
        },
      ]
    );
  };

  const handleApproveReset = (request: PasswordResetRequest) => {
    Alert.alert(
      "Approve Password Reset",
      `Approve password reset request for ${request.username} (${request.email})?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Approve",
          style: "default",
          onPress: async () => {
            const success = await approvePasswordReset(request.id);
            if (success) {
              Alert.alert("Success", "Password reset approved. User can now reset their password.");
              loadResetRequests();
              loadUsersAndStats();
            }
          },
        },
      ]
    );
  };

  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (field: typeof sortBy) => {
    if (sortBy !== field) return null;
    return sortOrder === "asc" ? "↑" : "↓";
  };

  const userHasPendingRequest = (userId: number) => {
    return resetRequests.some(req => req.userId === userId && req.status === 'pending');
  };

  // Generate actual preview bars for user activities with proper color coding
  const generatePreviewBars = async (userId: number) => {
    const stats = userStats[userId];
    if (!stats || stats.activityCount === 0) {
      return Array(5).fill(0).map((_, i) => (
        <View
          key={i}
          style={[
            styles.graphBar,
            {
              height: '20%' as DimensionValue,
              backgroundColor: colors.border,
            }
          ]}
        />
      ));
    }

    // Get actual recent activities for the user
    const activities = await getActivitiesByUserId(userId);
    const recentActivities = activities.slice(0, 5).reverse(); // Get last 5 activities
    
    if (recentActivities.length === 0) {
      return Array(5).fill(0).map((_, i) => (
        <View
          key={i}
          style={[
            styles.graphBar,
            {
              height: '20%' as DimensionValue,
              backgroundColor: colors.border,
            }
          ]}
        />
      ));
    }

    // Calculate max for scaling
    const maxSteps = Math.max(...recentActivities.map(act => act.steps));
    const minSteps = Math.min(...recentActivities.map(act => act.steps));

    return recentActivities.map((activity, i) => {
      const heightPercent = Math.max((activity.steps / maxSteps) * 100, 10);
      
      // Color coding: lowest red, highest green, rest blue
      const barColor = 
        activity.steps === minSteps ? colors.danger : 
        activity.steps === maxSteps ? colors.primary : 
        colors.secondary;
      
      return (
        <View
          key={i}
          style={[
            styles.graphBar,
            {
              height: `${heightPercent}%` as DimensionValue,
              backgroundColor: barColor,
            }
          ]}
        />
      );
    });
  };

  const [previewBars, setPreviewBars] = useState<Record<number, JSX.Element[]>>({});

  // Load preview bars when user stats are calculated
  useEffect(() => {
    const loadPreviewBars = async () => {
      const bars: Record<number, JSX.Element[]> = {};
      for (const user of filteredUsers) {
        bars[user.id] = await generatePreviewBars(user.id);
      }
      setPreviewBars(bars);
    };

    if (filteredUsers.length > 0) {
      loadPreviewBars();
    }
  }, [filteredUsers, userStats]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: {
      fontSize: 24,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 16,
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.inputBackground,
      borderRadius: 8,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchInput: {
      flex: 1,
      padding: 12,
      color: colors.text,
      fontSize: 16,
    },
    sortContainer: {
      flexDirection: "row",
      padding: 16,
      gap: 8,
    },
    sortButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.cardBackground,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sortButtonText: {
      color: colors.text,
      fontSize: 12,
      fontWeight: "600",
      marginRight: 4,
    },
    userList: {
      padding: 16,
    },
    userCard: {
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    userHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 12,
    },
    userInfo: {
      flex: 1,
    },
    userName: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 4,
    },
    userEmail: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    userDetails: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    actionButtons: {
      flexDirection: "row",
      gap: 8,
    },
    actionButton: {
      padding: 8,
      borderRadius: 6,
      alignItems: "center",
      justifyContent: "center",
    },
    viewButton: {
      backgroundColor: colors.primary,
      width: 36,
      height: 36,
    },
    resetButton: {
      backgroundColor: '#f59e0b',
      width: 36,
      height: 36,
    },
    deleteButton: {
      backgroundColor: colors.danger,
      width: 36,
      height: 36,
    },
    statsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 12,
    },
    statItem: {
      flex: 1,
      minWidth: "45%",
      backgroundColor: colors.background,
      padding: 8,
      borderRadius: 6,
      alignItems: "center",
    },
    statValue: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.primary,
      marginBottom: 2,
    },
    statLabel: {
      fontSize: 10,
      color: colors.textSecondary,
      textAlign: "center",
    },
    previewContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    previewGraph: {
      flex: 1,
      height: 40,
      backgroundColor: colors.background,
      borderRadius: 6,
      padding: 4,
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-between",
    },
    graphBar: {
      flex: 1,
      borderRadius: 2,
      marginHorizontal: 1,
      minHeight: 4,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    emptyText: {
      textAlign: "center",
      color: colors.textSecondary,
      fontSize: 16,
      marginTop: 32,
    },
    adminNote: {
      textAlign: "center",
      color: colors.textSecondary,
      fontSize: 14,
      marginTop: 16,
      paddingHorizontal: 16,
    },
    notificationBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#f59e0b',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 6,
      marginHorizontal: 16,
      marginBottom: 8,
    },
    notificationText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 6,
    },
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.text, marginTop: 16 }}>Loading users...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>User Management</Text>
        
        {/* Pending Reset Requests Notification */}
        {hasPendingResetRequests && (
          <View style={styles.notificationBadge}>
            <AlertCircle size={16} color="#fff" />
            <Text style={styles.notificationText}>
              {resetRequests.filter(req => req.status === 'pending').length} pending password reset(s)
            </Text>
          </View>
        )}
        
        <View style={styles.searchContainer}>
          <Search size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users by name, email..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.sortContainer}>
        <TouchableOpacity style={styles.sortButton} onPress={() => toggleSort("firstName")}>
          <Text style={styles.sortButtonText}>Name {getSortIcon("firstName")}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sortButton} onPress={() => toggleSort("email")}>
          <Text style={styles.sortButtonText}>Email {getSortIcon("email")}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sortButton} onPress={() => toggleSort("totalSteps")}>
          <Text style={styles.sortButtonText}>Steps {getSortIcon("totalSteps")}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sortButton} onPress={() => toggleSort("avgSteps")}>
          <Text style={styles.sortButtonText}>Avg {getSortIcon("avgSteps")}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sortButton} onPress={() => toggleSort("skippedDays")}>
          <Text style={styles.sortButtonText}>Skipped {getSortIcon("skippedDays")}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.userList}>
        {filteredUsers.length === 0 ? (
          <Text style={styles.emptyText}>
            {searchQuery ? "No users found" : "No users available"}
          </Text>
        ) : (
          filteredUsers.map((user: UserType) => {
            const stats = userStats[user.id] || {
              totalSteps: 0,
              avgSteps: 0,
              activityCount: 0,
              maxSteps: 0,
              minSteps: 0,
              skippedDays: 0,
            };

            return (
              <View key={user.id} style={styles.userCard}>
                <View style={styles.userHeader}>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>
                      {user.firstName} {user.lastName}
                    </Text>
                    <Text style={styles.userEmail}>{user.email}</Text>
                    <Text style={styles.userDetails}>
                      @{user.username} • {user.phone} • Joined {new Date(user.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.viewButton]}
                      onPress={() => handleUserPress(user.id)}
                    >
                      <Eye size={16} color="#fff" />
                    </TouchableOpacity>
                    
                    {userHasPendingRequest(user.id) && (
                      <TouchableOpacity 
                        style={[styles.actionButton, styles.resetButton]}
                        onPress={() => handleApproveReset(resetRequests.find(req => req.userId === user.id && req.status === 'pending')!)}
                      >
                        <Key size={16} color="#fff" />
                      </TouchableOpacity>
                    )}
                    
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => handleDeleteUser(user)}
                    >
                      <Trash2 size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.statsGrid}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{stats.totalSteps.toLocaleString()}</Text>
                    <Text style={styles.statLabel}>Total Steps</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{stats.avgSteps.toLocaleString()}</Text>
                    <Text style={styles.statLabel}>Avg Steps</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{stats.activityCount}</Text>
                    <Text style={styles.statLabel}>Activities</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: stats.skippedDays > 10 ? colors.danger : colors.primary }]}>
                      {stats.skippedDays}
                    </Text>
                    <Text style={styles.statLabel}>Skipped Days</Text>
                  </View>
                </View>

                {/* Preview graph with actual activity bars */}
                <View style={styles.previewContainer}>
                  <Text style={[styles.userDetails, { width: 80 }]}>Activity Preview:</Text>
                  <View style={styles.previewGraph}>
                    {previewBars[user.id] || Array(5).fill(0).map((_, i) => (
                      <View
                        key={i}
                        style={[
                          styles.graphBar,
                          {
                            height: '20%' as DimensionValue,
                            backgroundColor: colors.border,
                          }
                        ]}
                      />
                    ))}
                  </View>
                </View>
              </View>
            );
          })
        )}
        
        <Text style={styles.adminNote}>
          As an admin, you can add your own activities from the Home tab to test the user experience.
        </Text>
      </ScrollView>
    </View>
  );
}