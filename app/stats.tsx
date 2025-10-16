import React, { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import { useActivities } from "../src/context/ActivitiesContext";
import { useTheme } from "../src/context/ThemeContext";

const { width } = Dimensions.get("window");

const StatsScreen: React.FC = () => {
  const { activities } = useActivities();
  const { colors } = useTheme();

  const stats = useMemo(() => {
    if (activities.length === 0) return { total: 0, avg: 0, max: 0, min: 0 };
    
    const total = activities.reduce((sum, act) => sum + act.steps, 0);
    const avg = Math.round(total / activities.length);
    const max = Math.max(...activities.map(act => act.steps));
    const min = Math.min(...activities.map(act => act.steps));
    
    return { total, avg, max, min };
  }, [activities]);

  // Get last 7 activities for the bar chart
  const recentActivities = useMemo(() => {
    return activities.slice(0, 7).reverse();
  }, [activities]);

  // Calculate max for scaling bars
  const maxSteps = useMemo(() => {
    if (recentActivities.length === 0) return 1;
    return Math.max(...recentActivities.map(act => act.steps));
  }, [recentActivities]);

  // Calculate step ranges for distribution
  const distribution = useMemo(() => {
    const ranges = {
      low: 0,
      medium: 0,
      high: 0, 
      veryHigh: 0,
    };

    activities.forEach(act => {
      if (act.steps <= 2000) ranges.low++;
      else if (act.steps <= 5000) ranges.medium++;
      else if (act.steps <= 10000) ranges.high++;
      else ranges.veryHigh++;
    });

    const total = activities.length || 1;
    return [
      { label: "0-2K", count: ranges.low, percent: (ranges.low / total) * 100, color: "#FF6B6B" },
      { label: "2K-5K", count: ranges.medium, percent: (ranges.medium / total) * 100, color: "#4ECDC4" },
      { label: "5K-10K", count: ranges.high, percent: (ranges.high / total) * 100, color: "#45B7D1" },
      { label: "10K+", count: ranges.veryHigh, percent: (ranges.veryHigh / total) * 100, color: "#96CEB4" },
    ].filter(item => item.count > 0);
  }, [activities]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
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
    },
    barWrapper: {
      flex: 1,
      alignItems: "center",
      marginHorizontal: 4,
    },
    bar: {
      width: "100%",
      backgroundColor: colors.primary,
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

  if (activities.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No data yet</Text>
        <Text style={styles.emptySubtext}>Add some activities to see statistics and charts</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
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

      {/* Bar Chart - Recent Activities */}
      {recentActivities.length > 0 && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Recent Activities</Text>
          <View style={styles.barChartContainer}>
            {recentActivities.map((activity, index) => {
              const heightPercent = (activity.steps / maxSteps) * 100;
              const date = new Date(activity.date * 1000);
              const dateLabel = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
              
              return (
                <View key={index} style={styles.barWrapper}>
                  <Text style={styles.barValue}>{(activity.steps / 1000).toFixed(1)}K</Text>
                  <View style={[styles.bar, { height: `${Math.max(heightPercent, 2)}%` }]} />
                  <Text style={styles.barLabel}>{dateLabel}</Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Distribution */}
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
  );
};

export default StatsScreen;