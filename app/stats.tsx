import React, { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import { VictoryChart, VictoryLine, VictoryAxis, VictoryBar, VictoryPie } from "victory";
import { useActivities } from "../src/context/ActivitiesContext";
import { useTheme } from "../src/context/ThemeContext";

const { width } = Dimensions.get("window");

const StatsScreen: React.FC = () => {
  const { activities } = useActivities();
  const { colors } = useTheme();

  const lineChartData = useMemo(() => {
    return activities
      .slice(0, 10)
      .reverse()
      .map((act, idx) => ({
        x: idx + 1,
        y: act.steps,
        label: new Date(act.date * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      }));
  }, [activities]);

  const barChartData = useMemo(() => {
    const grouped: { [key: string]: number } = {};
    
    activities.forEach(act => {
      const date = new Date(act.date * 1000).toLocaleDateString();
      grouped[date] = (grouped[date] || 0) + act.steps;
    });

    return Object.entries(grouped)
      .slice(0, 7)
      .map(([date, steps]) => ({
        x: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        y: steps,
      }));
  }, [activities]);

  const pieChartData = useMemo(() => {
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

    return [
      { x: "0-2K", y: ranges.low, color: "#FF6B6B" },
      { x: "2K-5K", y: ranges.medium, color: "#4ECDC4" },
      { x: "5K-10K", y: ranges.high, color: "#45B7D1" },
      { x: "10K+", y: ranges.veryHigh, color: "#96CEB4" },
    ].filter(item => item.y > 0);
  }, [activities]);

  const stats = useMemo(() => {
    if (activities.length === 0) return { total: 0, avg: 0, max: 0, min: 0 };
    
    const total = activities.reduce((sum, act) => sum + act.steps, 0);
    const avg = Math.round(total / activities.length);
    const max = Math.max(...activities.map(act => act.steps));
    const min = Math.min(...activities.map(act => act.steps));
    
    return { total, avg, max, min };
  }, [activities]);

  const axisStyle = {
    axis: { stroke: colors.text },
    tickLabels: { fontSize: 10, fill: colors.text, angle: -45, textAnchor: "end" },
    grid: { stroke: colors.border, strokeDasharray: "3,3" },
  };

  const dependentAxisStyle = {
    axis: { stroke: colors.text },
    tickLabels: { fontSize: 10, fill: colors.text },
    grid: { stroke: colors.border, strokeDasharray: "3,3" },
  };

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
      marginBottom: 12,
    },
    pieChartContainer: {
      alignItems: "center",
    },
    legendContainer: {
      marginTop: 12,
    },
    legendItem: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    legendColor: {
      width: 16,
      height: 16,
      borderRadius: 8,
      marginRight: 8,
    },
    legendText: {
      fontSize: 14,
      color: colors.textSecondary,
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

      {lineChartData.length > 0 && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Steps Over Time</Text>
          <VictoryChart width={width - 32} height={250}>
            <VictoryAxis style={axisStyle} tickFormat={(t) => String(t)} />
            <VictoryAxis dependentAxis style={dependentAxisStyle} tickFormat={(t) => String(t)} />
            <VictoryLine
              data={lineChartData}
              style={{ data: { stroke: colors.primary, strokeWidth: 3 } }}
              animate={{ duration: 1000, onLoad: { duration: 500 } }}
            />
          </VictoryChart>
        </View>
      )}

      {barChartData.length > 0 && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Daily Steps Comparison</Text>
          <VictoryChart width={width - 32} height={250} domainPadding={{ x: 20 }}>
            <VictoryAxis style={axisStyle} tickFormat={(t) => String(t)} />
            <VictoryAxis dependentAxis style={dependentAxisStyle} tickFormat={(t) => String(t)} />
            <VictoryBar
              data={barChartData}
              style={{ data: { fill: "#4ECDC4" } }}
              animate={{ duration: 1000, onLoad: { duration: 500 } }}
            />
          </VictoryChart>
        </View>
      )}

      {pieChartData.length > 0 && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Activity Distribution</Text>
          <View style={styles.pieChartContainer}>
            <VictoryPie
              data={pieChartData}
              colorScale={pieChartData.map(d => d.color)}
              width={width - 32}
              height={300}
              style={{ labels: { fontSize: 14, fontWeight: "600", fill: colors.text } }}
              animate={{ duration: 1000, onLoad: { duration: 500 } }}
            />
          </View>
          <View style={styles.legendContainer}>
            {pieChartData.map((item, idx) => (
              <View key={idx} style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                <Text style={styles.legendText}>
                  {item.x}: {item.y} activities
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default StatsScreen;