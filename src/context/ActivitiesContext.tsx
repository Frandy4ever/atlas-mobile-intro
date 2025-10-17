import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import * as SQLite from "expo-sqlite";

export interface Activity {
  id: number;
  steps: number;
  date: number;
}

interface ActivitiesContextType {
  activities: Activity[];
  loading: boolean;
  addActivity: (steps: number, date?: number) => Promise<void>;
  updateActivity: (id: number, steps: number) => Promise<void>;
  deleteActivity: (id: number) => Promise<void>;
  deleteAllActivities: () => Promise<void>;
}

const ActivitiesContext = createContext<ActivitiesContextType | undefined>(undefined);

export const ActivitiesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);

  useEffect(() => {
    initDatabase();
  }, []);

  const initDatabase = async () => {
    try {
      const database = await SQLite.openDatabaseAsync("activities.db");
      console.log("Database opened successfully");
      setDb(database);

      await database.execAsync(`
        CREATE TABLE IF NOT EXISTS activities (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          steps INTEGER NOT NULL,
          date INTEGER NOT NULL
        );
      `);
      console.log("Table created/verified successfully");

      await loadActivities(database);
    } catch (error) {
      console.error("Error initializing database:", error);
      setLoading(false);
    }
  };

  const loadActivities = async (database: SQLite.SQLiteDatabase) => {
    try {
      const result = await database.getAllAsync<Activity>(
        "SELECT * FROM activities ORDER BY date DESC"
      );
      console.log(`Loaded ${result.length} activities`);
      setActivities(result);
    } catch (error) {
      console.error("Error loading activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const addActivity = async (steps: number, date?: number) => {
    if (!db) return;
    
    try {
      const timestamp = date || Math.floor(Date.now() / 1000);
      await db.runAsync(
        "INSERT INTO activities (steps, date) VALUES (?, ?)",
        steps,
        timestamp
      );
      console.log(`Added activity with ${steps} steps`);
      await loadActivities(db);
    } catch (error) {
      console.error("Error adding activity:", error);
      throw error;
    }
  };

  const updateActivity = async (id: number, steps: number) => {
    if (!db) return;
    
    try {
      await db.runAsync(
        "UPDATE activities SET steps = ? WHERE id = ?",
        steps,
        id
      );
      console.log(`Updated activity ${id} with ${steps} steps`);
      await loadActivities(db);
    } catch (error) {
      console.error("Error updating activity:", error);
      throw error;
    }
  };

  const deleteActivity = async (id: number) => {
    if (!db) return;
    
    try {
      await db.runAsync("DELETE FROM activities WHERE id = ?", id);
      console.log(`Deleted activity ${id}`);
      await loadActivities(db);
    } catch (error) {
      console.error("Error deleting activity:", error);
      throw error;
    }
  };

  const deleteAllActivities = async () => {
    if (!db) return;
    
    try {
      await db.runAsync("DELETE FROM activities");
      console.log("Deleted all activities");
      await loadActivities(db);
    } catch (error) {
      console.error("Error deleting all activities:", error);
      throw error;
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