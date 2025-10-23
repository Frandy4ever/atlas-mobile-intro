import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import * as SQLite from "expo-sqlite";
import { useAuth } from "./AuthContext";

export interface ArchivedActivity {
  id: number;
  steps: number;
  date: number;
  archivedAt: number;
  userId: number; // Add userId
}

interface ArchiveContextType {
  archivedActivities: ArchivedActivity[];
  loading: boolean;
  archiveActivity: (id: number, steps: number, date: number) => Promise<void>;
  unarchiveActivity: (id: number) => Promise<void>;
  deleteArchivedActivity: (id: number) => Promise<void>;
  deleteAllArchived: () => Promise<void>;
  getArchivedActivitiesByUserId: (userId: number) => Promise<ArchivedActivity[]>; // For admin
}

const ArchiveContext = createContext<ArchiveContextType | undefined>(undefined);

export const ArchiveProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [archivedActivities, setArchivedActivities] = useState<ArchivedActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    initDatabase();
  }, []);

  useEffect(() => {
    if (db && user) {
      loadArchivedActivities(db);
    }
  }, [user, db]);

  // Check if archived_activities table needs migration
  const needsMigration = async (database: SQLite.SQLiteDatabase): Promise<boolean> => {
    try {
      // Use a more reliable method to check for column existence
      const tableInfo = await database.getAllAsync<{ name: string }>(
        "PRAGMA table_info(archived_activities)"
      );
      
      const hasUserId = tableInfo.some(column => column.name === 'userId');
      return !hasUserId;
    } catch (error: any) {
      // If table doesn't exist at all, we need to create it with the new schema
      if (error.message?.includes('no such table')) {
        return true;
      }
      console.error('Error checking migration needs:', error);
      return true; // Assume migration needed on error
    }
  };

  // Migrate archived_activities table to add userId column
  const migrateArchiveTable = async (database: SQLite.SQLiteDatabase): Promise<void> => {
    try {
      console.log('Migrating archived_activities table to add userId column...');
      
      // First check if table exists
      const tableExists = await database.getFirstAsync<{ name: string }>(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='archived_activities'"
      );

      if (!tableExists) {
        // Table doesn't exist, create it with new schema
        await database.execAsync(`
          CREATE TABLE IF NOT EXISTS archived_activities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            steps INTEGER NOT NULL,
            date INTEGER NOT NULL,
            archivedAt INTEGER NOT NULL,
            userId INTEGER NOT NULL DEFAULT 1
          );
        `);
        console.log('Created new archived_activities table with userId column');
        return;
      }

      // Table exists, check if we need to add the column
      const tableInfo = await database.getAllAsync<{ name: string }>(
        "PRAGMA table_info(archived_activities)"
      );
      
      const hasUserId = tableInfo.some(column => column.name === 'userId');
      
      if (!hasUserId) {
        // Add the column to existing table
        await database.execAsync(`
          ALTER TABLE archived_activities ADD COLUMN userId INTEGER NOT NULL DEFAULT 1
        `);
        console.log('Successfully added userId column to archived_activities table');
      } else {
        console.log('userId column already exists, no migration needed');
      }

    } catch (error) {
      console.error('Archive migration failed:', error);
      // If migration fails, create fresh table
      await database.execAsync(`
        CREATE TABLE IF NOT EXISTS archived_activities (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          steps INTEGER NOT NULL,
          date INTEGER NOT NULL,
          archivedAt INTEGER NOT NULL,
          userId INTEGER NOT NULL DEFAULT 1
        );
      `);
    }
  };

  const initDatabase = async () => {
    try {
      const database = await SQLite.openDatabaseAsync("activities.db");
      setDb(database);

      // Check if migration is needed
      const shouldMigrate = await needsMigration(database);

      if (shouldMigrate) {
        console.log("Archive database migration needed, performing migration...");
        await migrateArchiveTable(database);
        console.log("Archive database migration completed");
      } else {
        await database.execAsync(`
          CREATE TABLE IF NOT EXISTS archived_activities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            steps INTEGER NOT NULL,
            date INTEGER NOT NULL,
            archivedAt INTEGER NOT NULL,
            userId INTEGER NOT NULL DEFAULT 1
          );
        `);
      }

      await loadArchivedActivities(database);
    } catch (error) {
      console.error("Error initializing archive database:", error);
      setLoading(false);
    }
  };

  const loadArchivedActivities = async (database: SQLite.SQLiteDatabase) => {
    if (!user) {
      setArchivedActivities([]);
      setLoading(false);
      return;
    }

    try {
      let result: ArchivedActivity[];
      
      if (user.isAdmin) {
        result = await database.getAllAsync<ArchivedActivity>(
          "SELECT * FROM archived_activities ORDER BY archivedAt DESC"
        );
      } else {
        result = await database.getAllAsync<ArchivedActivity>(
          "SELECT * FROM archived_activities WHERE userId = ? ORDER BY archivedAt DESC",
          [user.id]
        );
      }
      setArchivedActivities(result);
    } catch (error) {
      console.error("Error loading archived activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const archiveActivity = async (id: number, steps: number, date: number) => {
    if (!db || !user) return;
    
    try {
      const archivedAt = Math.floor(Date.now() / 1000);
      await db.runAsync(
        "INSERT INTO archived_activities (steps, date, archivedAt, userId) VALUES (?, ?, ?, ?)",
        steps,
        date,
        archivedAt,
        user.id
      );
      await loadArchivedActivities(db);
    } catch (error) {
      console.error("Error archiving activity:", error);
      throw error;
    }
  };

  const unarchiveActivity = async (id: number) => {
    if (!db || !user) return;
    
    try {
      if (user.isAdmin) {
        await db.runAsync("DELETE FROM archived_activities WHERE id = ?", id);
      } else {
        await db.runAsync("DELETE FROM archived_activities WHERE id = ? AND userId = ?", id, user.id);
      }
      await loadArchivedActivities(db);
    } catch (error) {
      console.error("Error unarchiving activity:", error);
      throw error;
    }
  };

  const deleteArchivedActivity = async (id: number) => {
    if (!db || !user) return;
    
    try {
      if (user.isAdmin) {
        await db.runAsync("DELETE FROM archived_activities WHERE id = ?", id);
      } else {
        await db.runAsync("DELETE FROM archived_activities WHERE id = ? AND userId = ?", id, user.id);
      }
      await loadArchivedActivities(db);
    } catch (error) {
      console.error("Error deleting archived activity:", error);
      throw error;
    }
  };

  const deleteAllArchived = async () => {
    if (!db || !user) return;
    
    try {
      if (user.isAdmin) {
        await db.runAsync("DELETE FROM archived_activities");
      } else {
        await db.runAsync("DELETE FROM archived_activities WHERE userId = ?", user.id);
      }
      await loadArchivedActivities(db);
    } catch (error) {
      console.error("Error deleting all archived activities:", error);
      throw error;
    }
  };

  const getArchivedActivitiesByUserId = async (userId: number): Promise<ArchivedActivity[]> => {
    if (!db) return [];
    
    try {
      const result = await db.getAllAsync<ArchivedActivity>(
        "SELECT * FROM archived_activities WHERE userId = ? ORDER BY archivedAt DESC",
        [userId]
      );
      return result;
    } catch (error) {
      console.error("Error getting archived activities by user ID:", error);
      return [];
    }
  };

  return (
    <ArchiveContext.Provider
      value={{
        archivedActivities,
        loading,
        archiveActivity,
        unarchiveActivity,
        deleteArchivedActivity,
        deleteAllArchived,
        getArchivedActivitiesByUserId,
      }}
    >
      {children}
    </ArchiveContext.Provider>
  );
};

export const useArchive = () => {
  const context = useContext(ArchiveContext);
  if (!context) {
    throw new Error("useArchive must be used within ArchiveProvider");
  }
  return context;
};