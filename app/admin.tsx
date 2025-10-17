import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { useTheme } from '../src/context/ThemeContext';
import { useAuth } from '../src/context/AuthContext';
import { Eye, EyeOff, Trash2, ArrowLeft, User, Mail, Phone, Calendar } from 'lucide-react-native';

interface AdminPanelProps {
  onClose: () => void;
}

export default function AdminPanel({ onClose }: AdminPanelProps) {
  const { colors } = useTheme();
  const { getAllUsers, resetUserPassword, deleteUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const userList = await getAllUsers();
    setUsers(userList);
  };

  const handleResetPassword = async () => {
    if (!newPassword.trim()) {
      Alert.alert('Error', 'Please enter a new password');
      return;
    }

    setIsResetting(true);
    const success = await resetUserPassword(selectedUser.id, newPassword);
    setIsResetting(false);

    if (success) {
      setNewPassword('');
      setSelectedUser(null);
      Alert.alert('Success', `Password reset for ${selectedUser.firstName} ${selectedUser.lastName}`);
    }
  };

  const handleDeleteUser = (user: any) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete ${user.firstName} ${user.lastName}'s account? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteUser(user.id);
            if (success) {
              loadUsers();
            }
          },
        },
      ]
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginLeft: 16,
    },
    content: {
      flex: 1,
      padding: 16,
    },
    userCard: {
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    userHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    userName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    userInfo: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    adminBadge: {
      backgroundColor: colors.primary,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    adminBadgeText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '600',
    },
    actionButtons: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 12,
    },
    button: {
      flex: 1,
      backgroundColor: colors.primary,
      padding: 8,
      borderRadius: 6,
      alignItems: 'center',
    },
    dangerButton: {
      backgroundColor: colors.danger,
      padding: 8,
      borderRadius: 6,
      alignItems: 'center',
      width: 40,
    },
    buttonText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '600',
    },
    modalContainer: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 16,
    },
    inputContainer: {
      position: 'relative',
      marginBottom: 16,
    },
    input: {
      backgroundColor: colors.inputBackground,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 14,
      color: colors.text,
      paddingRight: 50,
    },
    passwordToggle: {
      position: 'absolute',
      right: 12,
      top: 12,
      zIndex: 1,
    },
  });

  if (selectedUser) {
    return (
      <View style={styles.modalContainer}>
        <TouchableOpacity 
          style={styles.header} 
          onPress={() => setSelectedUser(null)}
        >
          <ArrowLeft size={24} color={colors.primary} />
          <Text style={styles.headerTitle}>Reset Password</Text>
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={{ color: colors.text, marginBottom: 16 }}>
            Reset password for {selectedUser.firstName} {selectedUser.lastName}
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="New Password"
              placeholderTextColor={colors.textSecondary}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity 
              style={styles.passwordToggle}
              onPress={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff size={20} color={colors.textSecondary} />
              ) : (
                <Eye size={20} color={colors.textSecondary} />
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[styles.button, isResetting && { backgroundColor: colors.textSecondary }]}
            onPress={handleResetPassword}
            disabled={isResetting}
          >
            <Text style={styles.buttonText}>
              {isResetting ? 'Resetting...' : 'Reset Password'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <ArrowLeft size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Panel - User Management</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={{ color: colors.textSecondary, marginBottom: 16 }}>
          Total Users: {users.length}
        </Text>

        {users.map((user) => (
          <View key={user.id} style={styles.userCard}>
            <View style={styles.userHeader}>
              <Text style={styles.userName}>
                {user.firstName} {user.lastName}
              </Text>
              {user.isAdmin && (
                <View style={styles.adminBadge}>
                  <Text style={styles.adminBadgeText}>ADMIN</Text>
                </View>
              )}
            </View>

            <Text style={styles.userInfo}>
              <User size={12} /> {user.username}
            </Text>
            <Text style={styles.userInfo}>
              <Mail size={12} /> {user.email}
            </Text>
            <Text style={styles.userInfo}>
              <Phone size={12} /> {user.phone}
            </Text>
            <Text style={styles.userInfo}>
              <Calendar size={12} /> {new Date(user.createdAt).toLocaleDateString()}
            </Text>

            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.button}
                onPress={() => setSelectedUser(user)}
              >
                <Text style={styles.buttonText}>Reset Password</Text>
              </TouchableOpacity>
              
              {!user.isAdmin && (
                <TouchableOpacity 
                  style={styles.dangerButton}
                  onPress={() => handleDeleteUser(user)}
                >
                  <Trash2 size={16} color="#fff" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}