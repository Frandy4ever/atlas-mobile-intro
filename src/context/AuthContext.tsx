import * as SQLite from 'expo-sqlite';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { AuthState, LoginData, RegisterData, UpdateUserData, User } from '../types/auth';

interface AuthContextType extends AuthState {
  register: (data: RegisterData) => Promise<boolean>;
  login: (data: LoginData) => Promise<boolean>;
  logout: () => void;
  updateUser: (id: number, data: UpdateUserData) => Promise<boolean>;
  deleteUser: (id: number) => Promise<boolean>;
  getAllUsers: () => Promise<User[]>;
  resetUserPassword: (id: number, newPassword: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Common weak passwords to check against
const WEAK_PASSWORDS = [
  'password', '123456', '12345678', '123456789', '1234567890',
  'qwerty', 'abc123', 'password1', 'admin', 'welcome'
];

export const AuthProvider: React.FC<{ children: React.ReactNode; }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);

  // Check if table needs migration
  const needsMigration = async (database: SQLite.SQLiteDatabase): Promise<boolean> => {
    try {
      await database.getAllAsync('SELECT firstName, lastName FROM users LIMIT 1');
      return false;
    } catch (error: any) {
      if (error.message?.includes('no such column') || error.message?.includes('no column named')) {
        return true;
      }
      return false;
    }
  };

  // Migrate database to new schema
  const migrateDatabase = async (database: SQLite.SQLiteDatabase): Promise<void> => {
    try {
      // Create backup of old table
      await database.execAsync(`
        CREATE TABLE IF NOT EXISTS users_backup AS SELECT * FROM users;
      `);

      // Drop old table
      await database.execAsync('DROP TABLE IF EXISTS users;');

      // Create new table with updated schema
      await database.execAsync(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          firstName TEXT NOT NULL,
          lastName TEXT NOT NULL,
          phone TEXT NOT NULL,
          isAdmin BOOLEAN DEFAULT FALSE,
          createdAt INTEGER NOT NULL
        );
      `);

      // Try to copy data from backup with default values for new columns
      try {
        await database.execAsync(`
          INSERT INTO users (id, email, username, password, firstName, lastName, phone, isAdmin, createdAt)
          SELECT id, email, username, password, 'User', 'Name', phone, isAdmin, createdAt FROM users_backup;
        `);
      } catch (backupError) {
        console.log('Could not migrate user data, starting fresh');
      }

      // Drop backup table
      await database.execAsync('DROP TABLE IF EXISTS users_backup;');

    } catch (error) {
      console.error('Migration failed:', error);
      // If migration fails, create fresh table
      await database.execAsync(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          firstName TEXT NOT NULL,
          lastName TEXT NOT NULL,
          phone TEXT NOT NULL,
          isAdmin BOOLEAN DEFAULT FALSE,
          createdAt INTEGER NOT NULL
        );
      `);
    }
  };

  // Initialize database and check for existing session
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Open database
        const database = await SQLite.openDatabaseAsync('app.db');
        setDb(database);

        // Check if migration is needed
        const shouldMigrate = await needsMigration(database);

        if (shouldMigrate) {
          console.log('Database migration needed, performing migration...');
          await migrateDatabase(database);
          console.log('Database migration completed');
        } else {
          // Ensure table exists with current schema
          await database.execAsync(`
            CREATE TABLE IF NOT EXISTS users (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              email TEXT UNIQUE NOT NULL,
              username TEXT UNIQUE NOT NULL,
              password TEXT NOT NULL,
              firstName TEXT NOT NULL,
              lastName TEXT NOT NULL,
              phone TEXT NOT NULL,
              isAdmin BOOLEAN DEFAULT FALSE,
              createdAt INTEGER NOT NULL
            );
          `);
        }

        // Check if admin user exists, if not create it
        const adminCheck = await database.getAllAsync<{ count: number; }>(
          'SELECT COUNT(*) as count FROM users WHERE email = ?',
          ['atlas@studentmail.com']
        );

        if (adminCheck[0]?.count === 0) {
          await database.runAsync(
            'INSERT INTO users (email, username, password, firstName, lastName, phone, isAdmin, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            ['atlas@studentmail.com', 'admin22', '@Atlas22', 'Admin', 'User', '0000000000', true, Date.now()]
          );
          console.log('Admin user created successfully');
        }

        // Check for existing session (you can implement persistent login here)
        setAuthState(prev => ({ ...prev, isLoading: false }));
      } catch (error) {
        console.error('Auth initialization error:', error);
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initAuth();
  }, []);

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateUsername = (username: string): boolean => {
    const usernameRegex = /^[a-zA-Z0-9]{3,15}$/;
    return usernameRegex.test(username);
  };

  const hasConsecutiveCharacters = (password: string): boolean => {
    for (let i = 0; i < password.length - 1; i++) {
      // Check for consecutive identical characters
      if (password[i] === password[i + 1]) {
        return true;
      }
      // Check for consecutive numbers (like 123, 234, etc.)
      if (
        /[0-9]/.test(password[i]) &&
        /[0-9]/.test(password[i + 1]) &&
        parseInt(password[i]) + 1 === parseInt(password[i + 1])
      ) {
        return true;
      }
      // Check for consecutive letters (like abc, bcd, etc.)
      if (
        /[a-zA-Z]/.test(password[i]) &&
        /[a-zA-Z]/.test(password[i + 1]) &&
        password.charCodeAt(i) + 1 === password.charCodeAt(i + 1)
      ) {
        return true;
      }
    }
    return false;
  };

  const isWeakPassword = (password: string): boolean => {
    const lowerPassword = password.toLowerCase();
    return WEAK_PASSWORDS.some(weak => lowerPassword.includes(weak.toLowerCase()));
  };

  const validatePassword = (password: string): { isValid: boolean; message: string; } => {
    if (password.length < 6) {
      return { isValid: false, message: 'Password must be at least 6 characters' };
    }

    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[@#!&$*]/.test(password);

    if (!hasLetter || !hasNumber || !hasSpecialChar) {
      return {
        isValid: false,
        message: 'Password must include at least one letter, one number, and one special character (@#!&$*)'
      };
    }

    if (hasConsecutiveCharacters(password)) {
      return {
        isValid: false,
        message: 'Password cannot contain consecutive characters or sequential patterns'
      };
    }

    if (isWeakPassword(password)) {
      return {
        isValid: false,
        message: 'Password is too common or weak. Please choose a stronger password'
      };
    }

    return { isValid: true, message: '' };
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
  };

  const checkEmailExists = async (email: string): Promise<boolean> => {
    if (!db) return false;
    try {
      const result = await db.getAllAsync<{ count: number; }>(
        'SELECT COUNT(*) as count FROM users WHERE email = ?',
        [email]
      );
      return result[0]?.count > 0;
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    }
  };

  const checkUsernameExists = async (username: string): Promise<boolean> => {
    if (!db) return false;
    try {
      const result = await db.getAllAsync<{ count: number; }>(
        'SELECT COUNT(*) as count FROM users WHERE username = ?',
        [username]
      );
      return result[0]?.count > 0;
    } catch (error) {
      console.error('Error checking username:', error);
      return false;
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    if (!db) {
      Alert.alert('Error', 'Database not initialized');
      return false;
    }

    try {
      // Validate all fields
      if (!validateEmail(data.email)) {
        Alert.alert('Error', 'Please enter a valid email address');
        return false;
      }

      if (!validateUsername(data.username)) {
        Alert.alert('Error', 'Username must be 3-15 characters (letters and numbers only, no spaces or special characters)');
        return false;
      }

      const passwordValidation = validatePassword(data.password);
      if (!passwordValidation.isValid) {
        Alert.alert('Error', passwordValidation.message);
        return false;
      }

      if (!validatePhone(data.phone)) {
        Alert.alert('Error', 'Please enter a valid 10-digit US phone number');
        return false;
      }

      if (!data.firstName.trim() || !data.lastName.trim()) {
        Alert.alert('Error', 'Please enter your first and last name');
        return false;
      }

      // Check if email already exists
      const emailExists = await checkEmailExists(data.email);
      if (emailExists) {
        Alert.alert(
          'Account Exists',
          'This email is already registered. Would you like to sign in or reset your password?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign In', onPress: () => { } }, // You can navigate to login
            { text: 'Reset Password', onPress: () => { } } // You can implement reset flow
          ]
        );
        return false;
      }

      // Check if username already exists
      const usernameExists = await checkUsernameExists(data.username);
      if (usernameExists) {
        Alert.alert(
          'Username Taken',
          'This username is already taken. Please choose a different username.',
          [
            { text: 'OK', style: 'default' }
          ]
        );
        return false;
      }

      // Insert new user
      const result = await db.runAsync(
        'INSERT INTO users (email, username, password, firstName, lastName, phone, isAdmin, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [data.email, data.username, data.password, data.firstName, data.lastName, data.phone, false, Date.now()]
      );

      const user: User = {
        id: result.lastInsertRowId as number,
        email: data.email,
        username: data.username,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        isAdmin: false,
        createdAt: Date.now(),
      };

      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });

      Alert.alert('Success', `Welcome, ${data.firstName}! Account created successfully!`);
      return true;

    } catch (error: any) {
      console.error('Registration error:', error);

      // Handle specific SQLite constraint errors
      if (error.message?.includes('UNIQUE constraint failed')) {
        if (error.message.includes('email')) {
          Alert.alert(
            'Account Exists',
            'This email is already registered. Please sign in or use a different email.',
            [
              { text: 'OK', style: 'default' }
            ]
          );
        } else if (error.message.includes('username')) {
          Alert.alert(
            'Username Taken',
            'This username is already taken. Please choose a different username.',
            [
              { text: 'OK', style: 'default' }
            ]
          );
        }
      } else {
        Alert.alert('Error', 'Failed to create account. Please try again.');
      }
      return false;
    }
  };

  const login = async (data: LoginData): Promise<boolean> => {
    if (!db) {
      Alert.alert('Error', 'Database not initialized');
      return false;
    }

    try {
      const result = await db.getAllAsync<User>(
        'SELECT * FROM users WHERE (email = ? OR username = ?) AND password = ?',
        [data.usernameOrEmail, data.usernameOrEmail, data.password]
      );

      if (result.length > 0) {
        const user = result[0];
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
        Alert.alert('Success', `Welcome back, ${user.firstName}!`);
        return true;
      } else {
        Alert.alert('Error', 'Invalid username/email or password');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Login failed');
      return false;
    }
  };

  const updateUser = async (id: number, data: UpdateUserData): Promise<boolean> => {
    if (!db) return false;

    try {
      if (data.password) {
        const passwordValidation = validatePassword(data.password);
        if (!passwordValidation.isValid) {
          Alert.alert('Error', passwordValidation.message);
          return false;
        }
      }

      if (data.username) {
        if (!validateUsername(data.username)) {
          Alert.alert('Error', 'Username must be 3-15 characters (letters and numbers only)');
          return false;
        }

        // Check if username is taken by another user
        const usernameExists = await db.getAllAsync<{ count: number; }>(
          'SELECT COUNT(*) as count FROM users WHERE username = ? AND id != ?',
          [data.username, id]
        );

        if (usernameExists[0]?.count > 0) {
          Alert.alert('Error', 'Username already taken');
          return false;
        }
      }

      const updates: string[] = [];
      const values: any[] = [];

      if (data.username) {
        updates.push('username = ?');
        values.push(data.username);
      }

      if (data.password) {
        updates.push('password = ?');
        values.push(data.password);
      }

      values.push(id);

      await db.runAsync(
        `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
        values
      );

      // Update current user in state if it's the logged-in user
      if (authState.user && authState.user.id === id) {
        setAuthState(prev => ({
          ...prev,
          user: {
            ...prev.user!,
            username: data.username || prev.user!.username,
          }
        }));
      }

      Alert.alert('Success', 'Profile updated successfully');
      return true;
    } catch (error) {
      console.error('Update user error:', error);
      Alert.alert('Error', 'Failed to update profile');
      return false;
    }
  };

  const deleteUser = async (id: number): Promise<boolean> => {
    if (!db) return false;

    try {
      await db.runAsync('DELETE FROM users WHERE id = ?', [id]);

      // If user deletes their own account, log them out
      if (authState.user && authState.user.id === id) {
        logout();
      }

      Alert.alert('Success', 'Account deleted successfully');
      return true;
    } catch (error) {
      console.error('Delete user error:', error);
      Alert.alert('Error', 'Failed to delete account');
      return false;
    }
  };

  const getAllUsers = async (): Promise<User[]> => {
    if (!db) {
      console.error('Database not initialized');
      return [];
    }

    try {
      const users = await db.getAllAsync<User>(
        'SELECT * FROM users ORDER BY createdAt DESC'
      );
      return users;
    } catch (error) {
      console.error('Get all users error:', error);
      return [];
    }
  };

  const resetUserPassword = async (id: number, newPassword: string): Promise<boolean> => {
    if (!db) return false;

    try {
      const passwordValidation = validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        Alert.alert('Error', passwordValidation.message);
        return false;
      }

      await db.runAsync(
        'UPDATE users SET password = ? WHERE id = ?',
        [newPassword, id]
      );

      Alert.alert('Success', 'Password reset successfully');
      return true;
    } catch (error) {
      console.error('Reset password error:', error);
      Alert.alert('Error', 'Failed to reset password');
      return false;
    }
  };

  const logout = () => {
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        register,
        login,
        logout,
        updateUser,
        deleteUser,
        getAllUsers,
        resetUserPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};