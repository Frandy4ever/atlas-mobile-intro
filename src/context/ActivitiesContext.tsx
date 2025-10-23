import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import * as SQLite from "expo-sqlite";
import { useAuth } from "./AuthContext";

export interface Activity {
  id: number;
  steps: number;
  date: number;
  userId: number;
  isProtected?: boolean; // New field to mark saved/protected activities
}

interface ActivitiesContextType {
  activities: Activity[];
  loading: boolean;
  addActivity: (steps: number, date?: number) => Promise<void>;
  updateActivity: (id: number, steps: number) => Promise<void>;
  deleteActivity: (id: number) => Promise<void>;
  deleteAllActivities: () => Promise<void>;
  getActivitiesByUserId: (userId: number) => Promise<Activity[]>;
  protectActivity: (id: number) => Promise<void>; // New function to protect activity
  unprotectActivity: (id: number) => Promise<void>; // New function to unprotect activity
  deleteAllUnprotected: () => Promise<void>; // New function to delete only unprotected activities
}

const ActivitiesContext = createContext<ActivitiesContextType | undefined>(undefined);

export const ActivitiesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    initDatabase();
  }, []);

  // Reload activities when user changes
  useEffect(() => {
    if (db && user) {
      loadActivities(db);
    }
  }, [user, db]);

  // Check if activities table needs migration for isProtected field
  const needsMigration = async (database: SQLite.SQLiteDatabase): Promise<boolean> => {
    try {
      // Use a more reliable method to check for column existence
      const tableInfo = await database.getAllAsync<{ name: string }>(
        "PRAGMA table_info(activities)"
      );
      
      const hasIsProtected = tableInfo.some(column => column.name === 'isProtected');
      return !hasIsProtected;
    } catch (error: any) {
      // If table doesn't exist at all, we need to create it with the new schema
      if (error.message?.includes('no such table')) {
        return true;
      }
      console.error('Error checking migration needs:', error);
      return true; // Assume migration needed on error
    }
  };

  // Migrate activities table to add isProtected column
  const migrateActivitiesTable = async (database: SQLite.SQLiteDatabase): Promise<void> => {
    try {
      console.log('Migrating activities table to add isProtected column...');
      
      // First check if table exists
      const tableExists = await database.getFirstAsync<{ name: string }>(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='activities'"
      );

      if (!tableExists) {
        // Table doesn't exist, create it with new schema
        await database.execAsync(`
          CREATE TABLE IF NOT EXISTS activities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            steps INTEGER NOT NULL,
            date INTEGER NOT NULL,
            userId INTEGER NOT NULL DEFAULT 1,
            isProtected BOOLEAN DEFAULT FALSE
          );
        `);
        console.log('Created new activities table with isProtected column');
        return;
      }

      // Table exists, check if we need to add the column
      const tableInfo = await database.getAllAsync<{ name: string }>(
        "PRAGMA table_info(activities)"
      );
      
      const hasIsProtected = tableInfo.some(column => column.name === 'isProtected');
      
      if (!hasIsProtected) {
        // Add the column to existing table
        await database.execAsync(`
          ALTER TABLE activities ADD COLUMN isProtected BOOLEAN DEFAULT FALSE
        `);
        console.log('Successfully added isProtected column to activities table');
      } else {
        console.log('isProtected column already exists, no migration needed');
      }

    } catch (error) {
      console.error('Activities migration failed:', error);
      // If migration fails, create fresh table
      await database.execAsync(`
        CREATE TABLE IF NOT EXISTS activities (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          steps INTEGER NOT NULL,
          date INTEGER NOT NULL,
          userId INTEGER NOT NULL DEFAULT 1,
          isProtected BOOLEAN DEFAULT FALSE
        );
      `);
    }
  };

  const initDatabase = async () => {
    try {
      const database = await SQLite.openDatabaseAsync("activities.db");
      console.log("Database opened successfully");
      setDb(database);

      // Check if migration is needed
      const shouldMigrate = await needsMigration(database);

      if (shouldMigrate) {
        console.log("Activities database migration needed, performing migration...");
        await migrateActivitiesTable(database);
        console.log("Activities database migration completed");
      } else {
        // Ensure table exists with current schema
        await database.execAsync(`
          CREATE TABLE IF NOT EXISTS activities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            steps INTEGER NOT NULL,
            date INTEGER NOT NULL,
            userId INTEGER NOT NULL DEFAULT 1,
            isProtected BOOLEAN DEFAULT FALSE
          );
        `);
        console.log("Activities table created/verified successfully");
      }

      await loadActivities(database);
    } catch (error) {
      console.error("Error initializing database:", error);
      setLoading(false);
    }
  };

  const loadActivities = async (database: SQLite.SQLiteDatabase) => {
    if (!user) {
      setActivities([]);
      setLoading(false);
      return;
    }

    try {
      let result: Activity[];
      
      // If user is admin, they can only see their own activities on home screen
      // For admin dashboard, they use getActivitiesByUserId to see other users' activities
      result = await database.getAllAsync<Activity>(
        "SELECT * FROM activities WHERE userId = ? ORDER BY date DESC",
        [user.id]
      );
      
      console.log(`Loaded ${result.length} activities for user ${user.id}`);
      setActivities(result);
    } catch (error) {
      console.error("Error loading activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const addActivity = async (steps: number, date?: number) => {
    if (!db || !user) return;
    
    try {
      const timestamp = date || Math.floor(Date.now() / 1000);
      await db.runAsync(
        "INSERT INTO activities (steps, date, userId, isProtected) VALUES (?, ?, ?, ?)",
        steps,
        timestamp,
        user.id,
        false // Default to not protected
      );
      console.log(`Added activity with ${steps} steps for user ${user.id}`);
      await loadActivities(db);
    } catch (error) {
      console.error("Error adding activity:", error);
      throw error;
    }
  };

  const updateActivity = async (id: number, steps: number) => {
    if (!db || !user) return;
    
    try {
      // Ensure user can only update their own activities unless admin
      if (user.isAdmin) {
        await db.runAsync(
          "UPDATE activities SET steps = ? WHERE id = ?",
          steps,
          id
        );
      } else {
        await db.runAsync(
          "UPDATE activities SET steps = ? WHERE id = ? AND userId = ?",
          steps,
          id,
          user.id
        );
      }
      console.log(`Updated activity ${id} with ${steps} steps`);
      await loadActivities(db);
    } catch (error) {
      console.error("Error updating activity:", error);
      throw error;
    }
  };

  const deleteActivity = async (id: number) => {
    if (!db || !user) return;
    
    try {
      // Ensure user can only delete their own activities unless admin
      if (user.isAdmin) {
        await db.runAsync("DELETE FROM activities WHERE id = ?", id);
      } else {
        await db.runAsync("DELETE FROM activities WHERE id = ? AND userId = ?", id, user.id);
      }
      console.log(`Deleted activity ${id}`);
      await loadActivities(db);
    } catch (error) {
      console.error("Error deleting activity:", error);
      throw error;
    }
  };

  const deleteAllActivities = async () => {
    if (!db || !user) return;
    
    try {
      // Ensure user can only delete their own activities unless admin
      if (user.isAdmin) {
        await db.runAsync("DELETE FROM activities WHERE userId = ?", user.id);
      } else {
        await db.runAsync("DELETE FROM activities WHERE userId = ?", user.id);
      }
      console.log("Deleted activities");
      await loadActivities(db);
    } catch (error) {
      console.error("Error deleting all activities:", error);
      throw error;
    }
  };

  const deleteAllUnprotected = async () => {
    if (!db || !user) return;
    
    try {
      // Delete only unprotected activities for the current user
      await db.runAsync("DELETE FROM activities WHERE userId = ? AND isProtected = FALSE", user.id);
      console.log("Deleted unprotected activities");
      await loadActivities(db);
    } catch (error) {
      console.error("Error deleting unprotected activities:", error);
      throw error;
    }
  };

  const protectActivity = async (id: number) => {
    if (!db || !user) return;
    
    try {
      if (user.isAdmin) {
        await db.runAsync(
          "UPDATE activities SET isProtected = TRUE WHERE id = ?",
          id
        );
      } else {
        await db.runAsync(
          "UPDATE activities SET isProtected = TRUE WHERE id = ? AND userId = ?",
          id,
          user.id
        );
      }
      console.log(`Protected activity ${id}`);
      await loadActivities(db);
    } catch (error) {
      console.error("Error protecting activity:", error);
      throw error;
    }
  };

  const unprotectActivity = async (id: number) => {
    if (!db || !user) return;
    
    try {
      if (user.isAdmin) {
        await db.runAsync(
          "UPDATE activities SET isProtected = FALSE WHERE id = ?",
          id
        );
      } else {
        await db.runAsync(
          "UPDATE activities SET isProtected = FALSE WHERE id = ? AND userId = ?",
          id,
          user.id
        );
      }
      console.log(`Unprotected activity ${id}`);
      await loadActivities(db);
    } catch (error) {
      console.error("Error unprotecting activity:", error);
      throw error;
    }
  };

  // Method for admin to get activities by user ID
  const getActivitiesByUserId = async (userId: number): Promise<Activity[]> => {
    if (!db) {
      console.error("Database not initialized");
      return [];
    }
    
    try {
      const result = await db.getAllAsync<Activity>(
        "SELECT * FROM activities WHERE userId = ? ORDER BY date DESC",
        [userId]
      );
      console.log(`Loaded ${result.length} activities for user ${userId}`);
      return result;
    } catch (error) {
      console.error("Error getting activities by user ID:", error);
      return [];
    }
  };

  return (
    <ActivitiesContext.Provider
      value={{
        activities,
        loading,
        addActivity,
        updateActivity,
        deleteActivity,
        deleteAllActivities,
        getActivitiesByUserId,
        protectActivity,
        unprotectActivity,
        deleteAllUnprotected,
      }}
    >
      {children}
    </ActivitiesContext.Provider>
  );
};

export const useActivities = () => {
  const context = useContext(ActivitiesContext);
  if (!context) {
    throw new Error("useActivities must be used within ActivitiesProvider");
  }
  return context;
};