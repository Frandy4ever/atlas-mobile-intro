import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Platform } from "react-native";
import * as SQLite from "expo-sqlite";

// -------------------------
// Types
// -------------------------
export type Activity = {
  id: number;
  steps: number;
  date: number; // unix seconds
};

type ActivitiesContextType = {
  activities: Activity[];
  loading: boolean;
  addActivity: (steps: number, date?: number) => Promise<void>;
  updateActivity: (id: number, steps: number) => Promise<void>;
  deleteActivity: (id: number) => Promise<void>;
  deleteAllActivities: () => Promise<void>;
  reload: () => Promise<void>;
};

// -------------------------
// Constants
// -------------------------
const TABLE_NAME = "activities";
const DB_NAME = "atlas_activities.db";

// -------------------------
// Open DB using the new API
// -------------------------
let db: SQLite.SQLiteDatabase | null = null;

if (Platform.OS === "android" || Platform.OS === "ios") {
  try {
    db = SQLite.openDatabaseSync(DB_NAME);
    console.log("Database opened successfully");
  } catch (error) {
    console.error("Failed to open database:", error);
  }
} else {
  console.warn("SQLite not supported on this platform (Web). DB disabled.");
}

// -------------------------
// Context
// -------------------------
const ActivitiesContext = createContext<ActivitiesContextType | undefined>(undefined);

// -------------------------
// Provider
// -------------------------
export const ActivitiesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const ensureTable = useCallback(async () => {
    if (!db) {
      console.warn("Database not available");
      return;
    }

    const createSql = `CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      steps INTEGER NOT NULL,
      date INTEGER NOT NULL
    );`;
    
    try {
      await db.execAsync(createSql);
      console.log("Table created/verified successfully");
    } catch (err) {
      console.error("CREATE TABLE error:", err);
    }
  }, []);

  const loadActivities = useCallback(async () => {
    if (!db) {
      console.warn("Database not available");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const result = await db.getAllAsync<Activity>(
        `SELECT id, steps, date FROM ${TABLE_NAME} ORDER BY date DESC;`
      );
      
      const parsed: Activity[] = result.map((r) => ({
        id: Number(r.id),
        steps: Number(r.steps),
        date: Number(r.date),
      }));
      
      setActivities(parsed);
      console.log(`Loaded ${parsed.length} activities`);
    } catch (err) {
      console.error("SELECT error:", err);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const addActivity = useCallback(async (steps: number, date?: number) => {
    if (!db) {
      throw new Error("Database not available");
    }

    if (typeof steps !== "number" || steps < 0) {
      throw new Error("Invalid steps value");
    }

    const ts = date ?? Math.floor(Date.now() / 1000);

    try {
      const result = await db.runAsync(
        `INSERT INTO ${TABLE_NAME} (steps, date) VALUES (?, ?);`,
        [steps, ts]
      );
      
      const insertedId = result.lastInsertRowId;
      const newRow: Activity = { 
        id: Number(insertedId), 
        steps, 
        date: ts 
      };
      
      // Update state optimistically
      setActivities(prev => [newRow, ...prev]);
      console.log(`Added activity with ${steps} steps`);
    } catch (err) {
      console.error("INSERT error:", err);
      throw err;
    }
  }, []);

  const updateActivity = useCallback(async (id: number, steps: number) => {
    if (!db) {
      throw new Error("Database not available");
    }

    if (typeof steps !== "number" || steps < 0) {
      throw new Error("Invalid steps value");
    }

    try {
      await db.runAsync(
        `UPDATE ${TABLE_NAME} SET steps = ? WHERE id = ?;`,
        [steps, id]
      );
      
      // Update state optimistically
      setActivities(prev => 
        prev.map(act => act.id === id ? { ...act, steps } : act)
      );
      console.log(`Updated activity ${id} with ${steps} steps`);
    } catch (err) {
      console.error("UPDATE error:", err);
      throw err;
    }
  }, []);

  const deleteActivity = useCallback(async (id: number) => {
    if (!db) {
      throw new Error("Database not available");
    }

    try {
      await db.runAsync(
        `DELETE FROM ${TABLE_NAME} WHERE id = ?;`,
        [id]
      );
      
      // Update state optimistically
      setActivities(prev => prev.filter(act => act.id !== id));
      console.log(`Deleted activity ${id}`);
    } catch (err) {
      console.error("DELETE error:", err);
      throw err;
    }
  }, []);

  const deleteAllActivities = useCallback(async () => {
    if (!db) {
      throw new Error("Database not available");
    }

    try {
      await db.runAsync(`DELETE FROM ${TABLE_NAME};`);
      setActivities([]);
      console.log("Deleted all activities");
    } catch (err) {
      console.error("DELETE ALL error:", err);
      throw err;
    }
  }, []);

  const reload = useCallback(async () => {
    await loadActivities();
  }, [loadActivities]);

  useEffect(() => {
    let mounted = true;
    
    (async () => {
      try {
        await ensureTable();
        if (!mounted) return;
        await loadActivities();
      } catch (err) {
        console.error("DB init error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [ensureTable, loadActivities]);

  return (
    <ActivitiesContext.Provider value={{ 
      activities, 
      loading, 
      addActivity, 
      updateActivity,
      deleteActivity,
      deleteAllActivities,
      reload 
    }}>
      {children}
    </ActivitiesContext.Provider>
  );
};

// -------------------------
// Hook
// -------------------------
export const useActivities = (): ActivitiesContextType => {
  const ctx = useContext(ActivitiesContext);
  if (!ctx) throw new Error("useActivities must be used within ActivitiesProvider");
  return ctx;
};