import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";
import { useActivities } from "../../src/context/ActivitiesContext";
import { useTheme } from "../../src/context/ThemeContext";
import { ArrowLeft } from "lucide-react-native";

const { width } = Dimensions.get("window");

export default function UserStatsScreen() {
  const { userId } = useLocalSearchParams();
  const { users, getAllUsers } = useAuth();
  const { getActivitiesByUserId } = useActivities();
  const { colors } = useTheme();
  const router = useRouter();
  
  const [userActivities, setUserActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadUserData();
  }, [userId]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      await getAllUsers();
      const foundUser = users.find(u => u.id === parseInt(userId as string));
      setUser(foundUser);

      if (foundUser) {
        const activities = await getActivitiesByUserId(foundUser.id);
        setUserActivities(activities);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    if (userActivities.length === 0) return { total: 0, avg: 0, max: 0, min: 0 };
    
    const total = userActivities.reduce((sum, act) => sum + act.steps, 0);
    const avg = Math.round(total / userActivities.length);
    const max = Math.max(...userActivities.map((act: any) => act.steps));
    const min = Math.min(...userActivities.map((act: any) => act.steps));
    
    return { total, avg, max, min };
  }, [userActivities]);

  // Get last 7 activities for the bar chart
  const recentActivities = useMemo(() => {
    return userActivities.slice(0, 7).reverse();
  }, [userActivities]);

  // Calculate max for scaling bars
  const maxSteps = useMemo(() => {
    if (recentActivities.length === 0) return 1;
    return Math.max(...recentActivities.map((act: any) => act.steps));
  }, [recentActivities]);

  // Calculate min for color coding
  const minSteps = useMemo(() => {
    if (recentActivities.length === 0) return 0;
    return Math.min(...recentActivities.map((act: any) => act.steps));
  }, [recentActivities]);

  // Calculate step ranges for distribution with color coding
  const distribution = useMemo(() => {
    const ranges = {
      low: 0,
      medium: 0,
      high: 0, 
      veryHigh: 0,
    };

    userActivities.forEach((act: any) => {
      if (act.steps <= 2000) ranges.low++;
      else if (act.steps <= 5000) ranges.medium++;
      else if (act.steps <= 10000) ranges.high++;
      else ranges.veryHigh++;
    });

    const total = userActivities.length || 1;
    
    // Use the same color coding: lowest red, highest green, rest blue
    return [
      { 
        label: "0-2K", 
        count: ranges.low, 
        percent: (ranges.low / total) * 100, 
        color: colors.danger // Red for lowest range
      },
      { 
        label: "2K-5K", 
        count: ranges.medium, 
        percent: (ranges.medium / total) * 100, 
        color: "#45B7D1" // Blue for medium
      },
      { 
        label: "5K-10K", 
        count: ranges.high, 
        percent: (ranges.high / total) * 100, 
        color: "#45B7D1" // Blue for high
      },
      { 
        label: "10K+", 
        count: ranges.veryHigh, 
        percent: (ranges.veryHigh / total) * 100, 
        color: colors.primary // Green for highest range
      },
    ].filter(item => item.count > 0);
  }, [userActivities, colors]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.cardBackground,
    },
    backButton: {
      marginRight: 16,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: colors.text,
    },
    userInfo: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 32,
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
    summaryContainer: {
      flexDirection: "row",
      padding: 16,
      gap: 12,
    },
    summaryCard: {
      flex: 1,
      backgroundColor: colors.cardBackground,
      padding: 20,
      borderRadius: 12,
      alignItems: "center",
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    summaryValue: {
      fontSize: 28,
      fontWeight: "700",
      color: colors.primary,
      marginBottom: 4,
    },
    summaryLabel: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    chartContainer: {
      backgroundColor: colors.cardBackground,
      marginHorizontal: 16,
      marginBottom: 16,
      borderRadius: 12,
      padding: 16,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    chartTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 16,
    },
    barChartContainer: {
      height: 200,
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-around",
      paddingHorizontal: 8,
      paddingTop: 20,
    },
    barWrapper: {
      flex: 1,
      alignItems: "center",
      marginHorizontal: 4,
    },
    bar: {
      width: "100%",
      borderTopLeftRadius: 4,
      borderTopRightRadius: 4,
      minHeight: 4,
    },
    barLabel: {
      fontSize: 10,
      color: colors.textSecondary,
      marginTop: 8,
      textAlign: "center",
    },
    barValue: {
      fontSize: 10,
      color: colors.text,
      fontWeight: "600",
      marginBottom: 4,
    },
    distributionItem: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
      paddingVertical: 8,
    },
    distributionColor: {
      width: 20,
      height: 20,
      borderRadius: 4,
      marginRight: 12,
    },
    distributionInfo: {
      flex: 1,
    },
    distributionLabel: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 2,
    },
    distributionCount: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    distributionPercent: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.primary,
      minWidth: 50,
      textAlign: "right",
    },
    progressBar: {
      height: 8,
      backgroundColor: colors.border,
      borderRadius: 4,
      marginTop: 8,
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      borderRadius: 4,
    },
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Loading...</Text>
        </View>
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>User Not Found</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>User not found</Text>
        </View>
      </View>
    );
  }

  if (userActivities.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={colors.primary} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>{user.firstName} {user.lastName}</Text>
            <Text style={styles.userInfo}>{user.email}</Text>
          </View>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No activity data</Text>
          <Text style={styles.emptySubtext}>This user hasn't added any activities yet</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.primary} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>{user.firstName} {user.lastName}</Text>
          <Text style={styles.userInfo}>{user.email}</Text>
        </View>
      </View>

      <ScrollView>
        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{stats.total.toLocaleString()}</Text>
            <Text style={styles.summaryLabel}>Total Steps</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{stats.avg.toLocaleString()}</Text>
            <Text style={styles.summaryLabel}>Average</Text>
          </View>
        </View>
        
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{stats.max.toLocaleString()}</Text>
            <Text style={styles.summaryLabel}>Max Steps</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{stats.min.toLocaleString()}</Text>
            <Text style={styles.summaryLabel}>Min Steps</Text>
          </View>
        </View>

        {/* Bar Chart - Recent Activities with Color Coding */}
        {recentActivities.length > 0 && (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Recent Activities</Text>
            <View style={styles.barChartContainer}>
              {recentActivities.map((activity: any, index: number) => {
                const heightPercent = (activity.steps / maxSteps) * 100;
                const date = new Date(activity.date * 1000);
                const dateLabel = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                
                // Color coding: lowest red, highest green, rest blue
                const barColor = 
                  activity.steps === minSteps ? colors.danger : 
                  activity.steps === maxSteps ? colors.primary : 
                  "#45B7D1";
                
                return (
                  <View key={index} style={styles.barWrapper}>
                    <Text style={styles.barValue}>{(activity.steps / 1000).toFixed(1)}K</Text>
                    <View 
                      style={[
                        styles.bar, 
                        { 
                          height: `${Math.max(heightPercent, 2)}%`,
                          backgroundColor: barColor
                        }
                      ]} 
                    />
                    <Text style={styles.barLabel}>{dateLabel}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Distribution with Color Coding */}
        {distribution.length > 0 && (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Activity Distribution</Text>
            {distribution.map((item, index) => (
              <View key={index}>
                <View style={styles.distributionItem}>
                  <View style={[styles.distributionColor, { backgroundColor: item.color }]} />
                  <View style={styles.distributionInfo}>
                    <Text style={styles.distributionLabel}>{item.label}</Text>
                    <Text style={styles.distributionCount}>{item.count} activities</Text>
                  </View>
                  <Text style={styles.distributionPercent}>{item.percent.toFixed(0)}%</Text>
                </View>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${item.percent}%`, backgroundColor: item.color }
                    ]} 
                  />
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}