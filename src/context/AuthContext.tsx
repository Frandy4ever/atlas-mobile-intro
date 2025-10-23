import * as SQLite from 'expo-sqlite';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { AuthState, LoginData, RegisterData, UpdateUserData, User, PasswordResetRequest } from '../types/auth';

interface AuthContextType extends AuthState {
  register: (data: RegisterData) => Promise<boolean>;
  login: (data: LoginData) => Promise<boolean>;
  logout: () => void;
  updateUser: (id: number, data: UpdateUserData) => Promise<boolean>;
  deleteUser: (id: number) => Promise<boolean>;
  getAllUsers: () => Promise<User[]>;
  resetUserPassword: (id: number, newPassword: string) => Promise<boolean>;
  users: User[];
  passwordResetRequests: PasswordResetRequest[];
  requestPasswordReset: (username: string, email: string) => Promise<boolean>;
  approvePasswordReset: (requestId: number) => Promise<boolean>;
  completePasswordReset: (username: string, email: string, newPassword: string) => Promise<boolean>;
  getPendingResetRequests: () => Promise<PasswordResetRequest[]>;
  hasPendingResetRequests: boolean;
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
  const [users, setUsers] = useState<User[]>([]);
  const [passwordResetRequests, setPasswordResetRequests] = useState<PasswordResetRequest[]>([]);
  const [hasPendingResetRequests, setHasPendingResetRequests] = useState(false);

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

        // Create password reset requests table
        await database.execAsync(`
          CREATE TABLE IF NOT EXISTS password_reset_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER NOT NULL,
            username TEXT NOT NULL,
            email TEXT NOT NULL,
            requestedAt INTEGER NOT NULL,
            status TEXT NOT NULL,
            approvedBy INTEGER,
            approvedAt INTEGER,
            completedAt INTEGER,
            FOREIGN KEY (userId) REFERENCES users (id),
            FOREIGN KEY (approvedBy) REFERENCES users (id)
          );
        `);

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

        // Load all users
        const userList = await database.getAllAsync<User>(
          'SELECT * FROM users ORDER BY createdAt DESC'
        );
        setUsers(userList);

        // Load password reset requests
        await loadPasswordResetRequests();

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

  const loadPasswordResetRequests = async () => {
    if (!db) return;
    
    try {
      const requests = await db.getAllAsync<PasswordResetRequest>(
        'SELECT * FROM password_reset_requests ORDER BY requestedAt DESC'
      );
      setPasswordResetRequests(requests);
      
      const pendingRequests = requests.filter(req => req.status === 'pending');
      setHasPendingResetRequests(pendingRequests.length > 0);
    } catch (error) {
      console.error('Error loading password reset requests:', error);
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

      // Update users list
      const userList = await db.getAllAsync<User>(
        'SELECT * FROM users ORDER BY createdAt DESC'
      );
      setUsers(userList);

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
      // Validate password if provided
      if (data.password) {
        const passwordValidation = validatePassword(data.password);
        if (!passwordValidation.isValid) {
          Alert.alert('Error', passwordValidation.message);
          return false;
        }
      }

      // Validate username if provided
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

      // Validate email if provided
      if (data.email) {
        if (!validateEmail(data.email)) {
          Alert.alert('Error', 'Please enter a valid email address');
          return false;
        }

        // Check if email is taken by another user
        const emailExists = await db.getAllAsync<{ count: number; }>(
          'SELECT COUNT(*) as count FROM users WHERE email = ? AND id != ?',
          [data.email, id]
        );

        if (emailExists[0]?.count > 0) {
          Alert.alert('Error', 'Email already taken');
          return false;
        }
      }

      // Validate phone if provided
      if (data.phone) {
        if (!validatePhone(data.phone)) {
          Alert.alert('Error', 'Please enter a valid 10-digit phone number');
          return false;
        }
      }

      const updates: string[] = [];
      const values: any[] = [];

      if (data.email) {
        updates.push('email = ?');
        values.push(data.email);
      }

      if (data.username) {
        updates.push('username = ?');
        values.push(data.username);
      }

      if (data.phone) {
        updates.push('phone = ?');
        values.push(data.phone);
      }

      if (data.password) {
        updates.push('password = ?');
        values.push(data.password);
      }

      if (updates.length === 0) {
        Alert.alert('Info', 'No changes to update');
        return false;
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
            email: data.email || prev.user!.email,
            username: data.username || prev.user!.username,
            phone: data.phone || prev.user!.phone,
          }
        }));
      }

      // Update users list
      const userList = await db.getAllAsync<User>(
        'SELECT * FROM users ORDER BY createdAt DESC'
      );
      setUsers(userList);

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
      // Delete user's password reset requests first
      await db.runAsync(
        'DELETE FROM password_reset_requests WHERE userId = ?',
        [id]
      );

      // Delete the user
      await db.runAsync('DELETE FROM users WHERE id = ?', [id]);

      // Update users list
      const userList = await db.getAllAsync<User>(
        'SELECT * FROM users ORDER BY createdAt DESC'
      );
      setUsers(userList);

      // Reload password reset requests to update UI
      await loadPasswordResetRequests();

      // If user deletes their own account, log them out
      if (authState.user && authState.user.id === id) {
        logout();
      }

      Alert.alert('Success', 'Account and associated password reset requests deleted successfully');
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
      const userList = await db.getAllAsync<User>(
        'SELECT * FROM users ORDER BY createdAt DESC'
      );
      setUsers(userList);
      return userList;
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

  const requestPasswordReset = async (username: string, email: string): Promise<boolean> => {
    if (!db) return false;

    try {
      // Find user by username and email
      const userResult = await db.getAllAsync<User>(
        'SELECT * FROM users WHERE username = ? AND email = ?',
        [username, email]
      );

      if (userResult.length === 0) {
        Alert.alert('Error', 'No user found with that username and email combination');
        return false;
      }

      const user = userResult[0];

      // Check if there's already a pending request
      const existingRequest = await db.getAllAsync<PasswordResetRequest>(
        'SELECT * FROM password_reset_requests WHERE userId = ? AND status = ?',
        [user.id, 'pending']
      );

      if (existingRequest.length > 0) {
        Alert.alert('Request Already Pending', 'You already have a pending password reset request. Please wait for administrator approval.');
        return false;
      }

      // Create new reset request
      await db.runAsync(
        'INSERT INTO password_reset_requests (userId, username, email, requestedAt, status) VALUES (?, ?, ?, ?, ?)',
        [user.id, username, email, Date.now(), 'pending']
      );

      // Reload reset requests
      await loadPasswordResetRequests();
      
      Alert.alert('Success', 'Password reset request submitted. An administrator will review your request.');
      return true;
    } catch (error) {
      console.error('Error requesting password reset:', error);
      Alert.alert('Error', 'Failed to submit password reset request');
      return false;
    }
  };

  const approvePasswordReset = async (requestId: number): Promise<boolean> => {
    if (!db || !authState.user) return false;

    try {
      await db.runAsync(
        'UPDATE password_reset_requests SET status = ?, approvedBy = ?, approvedAt = ? WHERE id = ?',
        ['approved', authState.user.id, Date.now(), requestId]
      );

      await loadPasswordResetRequests();
      return true;
    } catch (error) {
      console.error('Error approving password reset:', error);
      return false;
    }
  };

  const completePasswordReset = async (username: string, email: string, newPassword: string): Promise<boolean> => {
    if (!db) return false;

    try {
      // Validate password
      const passwordValidation = validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        Alert.alert('Error', passwordValidation.message);
        return false;
      }

      // Find approved reset request
      const requestResult = await db.getAllAsync<PasswordResetRequest>(
        'SELECT * FROM password_reset_requests WHERE username = ? AND email = ? AND status = ?',
        [username, email, 'approved']
      );

      if (requestResult.length === 0) {
        Alert.alert('Error', 'No approved password reset request found. Please contact administrator.');
        return false;
      }

      const request = requestResult[0];

      // Update user password
      await db.runAsync(
        'UPDATE users SET password = ? WHERE id = ?',
        [newPassword, request.userId]
      );

      // Mark request as completed
      await db.runAsync(
        'UPDATE password_reset_requests SET status = ?, completedAt = ? WHERE id = ?',
        ['completed', Date.now(), request.id]
      );

      await loadPasswordResetRequests();
      Alert.alert('Success', 'Password reset successfully! You can now login with your new password.');
      return true;
    } catch (error) {
      console.error('Error completing password reset:', error);
      Alert.alert('Error', 'Failed to reset password');
      return false;
    }
  };

  const getPendingResetRequests = async (): Promise<PasswordResetRequest[]> => {
    if (!db) return [];
    
    try {
      const requests = await db.getAllAsync<PasswordResetRequest>(
        'SELECT * FROM password_reset_requests WHERE status = ? ORDER BY requestedAt DESC',
        ['pending']
      );
      return requests;
    } catch (error) {
      console.error('Error getting pending reset requests:', error);
      return [];
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
        users,
        passwordResetRequests,
        hasPendingResetRequests,
        register,
        login,
        logout,
        updateUser,
        deleteUser,
        getAllUsers,
        resetUserPassword,
        requestPasswordReset,
        approvePasswordReset,
        completePasswordReset,
        getPendingResetRequests,
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