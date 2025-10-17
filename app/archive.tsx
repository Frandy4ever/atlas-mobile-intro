import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useTheme } from '../src/context/ThemeContext';
import { useArchive } from '../src/context/ArchiveContext';
import ArchivedItem from '../src/components/ArchivedItem';
import { Trash2 } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { ArchivedActivity } from '../src/context/ArchiveContext';

const ArchiveScreen: React.FC = () => {
  const { colors } = useTheme();
  const { archivedActivities, deleteAllArchived, deleteArchivedActivity, unarchiveActivity } = useArchive();
  const [searchQuery, setSearchQuery] = useState('');

  // This helps ensure the badge updates when archive changes
  useFocusEffect(
    React.useCallback(() => {
      // The badge will update automatically via the context
    }, [archivedActivities])
  );

  const filteredActivities = useMemo(() => {
    const trimmed = searchQuery.trim();
    if (trimmed.length === 0) return archivedActivities;

    const query = trimmed.toLowerCase();
    
    return archivedActivities.filter(activity => {
      const stepsMatch = activity.steps.toString().includes(query);
      const date = new Date(activity.date * 1000);
      const dateStr = date.toLocaleDateString().toLowerCase();
      const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase();
      const dateMatch = dateStr.includes(query) || timeStr.includes(query);
      return stepsMatch || dateMatch;
    });
  }, [archivedActivities, searchQuery]);

  const handleClearArchive = () => {
    if (archivedActivities.length === 0) return;

    Alert.alert(
      'Clear Archive',
      `Are you sure you want to permanently delete all ${archivedActivities.length} archived activities? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: () => deleteAllArchived(),
        },
      ]
    );
  };

  const handleDeleteActivity = async (item: ArchivedActivity) => {
    try {
      await deleteArchivedActivity(item.id);
    } catch (err) {
      Alert.alert('Error', 'Failed to delete archived activity');
    }
  };

  const handleUnarchiveActivity = async (item: ArchivedActivity) => {
    try {
      await unarchiveActivity(item.id);
      Alert.alert('Success', 'Activity restored from archive!');
    } catch (err) {
      Alert.alert('Error', 'Failed to restore activity from archive');
    }
  };

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
      fontWeight: '700',
      color: colors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    statsContainer: {
      flexDirection: 'row',
      padding: 16,
      gap: 12,
    },
    statBox: {
      flex: 1,
      backgroundColor: colors.cardBackground,
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    statValue: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.primary,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    listContainer: {
      flex: 1,
      paddingHorizontal: 16,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
    },
    emptyText: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    emptySubtext: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    clearButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.danger,
      padding: 12,
      borderRadius: 8,
      margin: 16,
      gap: 8,
    },
    clearButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
  });

  const totalSteps = useMemo(() => {
    return archivedActivities.reduce((sum, activity) => sum + activity.steps, 0);
  }, [archivedActivities]);

  const averageSteps = useMemo(() => {
    return archivedActivities.length > 0 
      ? Math.round(totalSteps / archivedActivities.length) 
      : 0;
  }, [archivedActivities, totalSteps]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Archive</Text>
        <Text style={styles.subtitle}>
          {archivedActivities.length} archived activit{archivedActivities.length === 1 ? 'y' : 'ies'}
        </Text>
      </View>

      {/* Stats */}
      {archivedActivities.length > 0 && (
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{totalSteps.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Total Steps</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{averageSteps.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Avg Steps</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{archivedActivities.length}</Text>
            <Text style={styles.statLabel}>Activities</Text>
          </View>
        </View>
      )}

      {/* Activities List */}
      {archivedActivities.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No archived activities yet</Text>
          <Text style={styles.emptySubtext}>
            Activities you archive will appear here for permanent storage
          </Text>
        </View>
      ) : (
        <View style={styles.listContainer}>
          <FlashList<ArchivedActivity>
            data={filteredActivities}
            renderItem={({ item }) => (
              <ArchivedItem
                item={item}
                onDelete={handleDeleteActivity}
                onUnarchive={handleUnarchiveActivity}
              />
            )}
            estimatedItemSize={80}
            keyExtractor={(item) => item.id.toString()}
          />
        </View>
      )}

      {/* Clear Archive Button */}
      {archivedActivities.length > 0 && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleClearArchive}
        >
          <Trash2 size={20} color="#fff" />
          <Text style={styles.clearButtonText}>
            Clear Archive ({archivedActivities.length})
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ArchiveScreen;