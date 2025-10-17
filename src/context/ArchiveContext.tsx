import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import * as SQLite from "expo-sqlite";

export interface ArchivedActivity {
  id: number;
  steps: number;
  date: number;
  archivedAt: number;
}

interface ArchiveContextType {
  archivedActivities: ArchivedActivity[];
  loading: boolean;
  archiveActivity: (id: number, steps: number, date: number) => Promise<void>;
  unarchiveActivity: (id: number) => Promise<void>;
  deleteArchivedActivity: (id: number) => Promise<void>;
  deleteAllArchived: () => Promise<void>;
}

const ArchiveContext = createContext<ArchiveContextType | undefined>(undefined);

export const ArchiveProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [archivedActivities, setArchivedActivities] = useState<ArchivedActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);

  useEffect(() => {
    initDatabase();
  }, []);

  const initDatabase = async () => {
    try {
      const database = await SQLite.openDatabaseAsync("activities.db");
      setDb(database);

      await database.execAsync(`
        CREATE TABLE IF NOT EXISTS archived_activities (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          steps INTEGER NOT NULL,
          date INTEGER NOT NULL,
          archivedAt INTEGER NOT NULL
        );
      `);

      await loadArchivedActivities(database);
    } catch (error) {
      console.error("Error initializing archive database:", error);
      setLoading(false);
    }
  };

  const loadArchivedActivities = async (database: SQLite.SQLiteDatabase) => {
    try {
      const result = await database.getAllAsync<ArchivedActivity>(
        "SELECT * FROM archived_activities ORDER BY archivedAt DESC"
      );
      setArchivedActivities(result);
    } catch (error) {
      console.error("Error loading archived activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const archiveActivity = async (id: number, steps: number, date: number) => {
    if (!db) return;
    
    try {
      const archivedAt = Math.floor(Date.now() / 1000);
      await db.runAsync(
        "INSERT INTO archived_activities (steps, date, archivedAt) VALUES (?, ?, ?)",
        steps,
        date,
        archivedAt
      );
      await loadArchivedActivities(db);
    } catch (error) {
      console.error("Error archiving activity:", error);
      throw error;
    }
  };

  const unarchiveActivity = async (id: number) => {
    if (!db) return;
    
    try {
      await db.runAsync("DELETE FROM archived_activities WHERE id = ?", id);
      await loadArchivedActivities(db);
    } catch (error) {
      console.error("Error unarchiving activity:", error);
      throw error;
    }
  };

  const deleteArchivedActivity = async (id: number) => {
    if (!db) return;
    
    try {
      await db.runAsync("DELETE FROM archived_activities WHERE id = ?", id);
      await loadArchivedActivities(db);
    } catch (error) {
      console.error("Error deleting archived activity:", error);
      throw error;
    }
  };

  const deleteAllArchived = async () => {
    if (!db) return;
    
    try {
      await db.runAsync("DELETE FROM archived_activities");
      await loadArchivedActivities(db);
    } catch (error) {
      console.error("Error deleting all archived activities:", error);
      throw error;
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