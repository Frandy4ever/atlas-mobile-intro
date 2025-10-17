import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Modal,
} from 'react-native';
import { useTheme } from '../src/context/ThemeContext';
import { useAuth } from '../src/context/AuthContext';
import { Eye, EyeOff, Trash2, User, Shield, LogOut, ArrowLeft } from 'lucide-react-native';

export default function SettingsScreen() {
  const { colors } = useTheme();
  const { user, updateUser, deleteUser, logout } = useAuth();
  const [newUsername, setNewUsername] = useState(user?.username || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  const handleUpdateProfile = async () => {
    if (!newUsername.trim()) {
      Alert.alert('Error', 'Please enter a username');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    const updateData: any = { username: newUsername };
    if (newPassword) {
      updateData.password = newPassword;
    }

    const success = await updateUser(user!.id, updateData);
    if (success) {
      setIsEditing(false);
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteUser(user!.id),
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 16,
    },
    section: {
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 16,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    label: {
      fontSize: 14,
      color: colors.textSecondary,
      flex: 1,
    },
    value: {
      fontSize: 14,
      color: colors.text,
      flex: 2,
      textAlign: 'right',
    },
    input: {
      backgroundColor: colors.inputBackground,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 14,
      color: colors.text,
      marginBottom: 12,
    },
    inputContainer: {
      position: 'relative',
      marginBottom: 12,
    },
    passwordToggle: {
      position: 'absolute',
      right: 12,
      top: 12,
      zIndex: 1,
    },
    button: {
      backgroundColor: colors.primary,
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginBottom: 8,
    },
    buttonText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '600',
    },
    dangerButton: {
      backgroundColor: colors.danger,
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 8,
    },
    editButton: {
      backgroundColor: colors.textSecondary,
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginBottom: 8,
    },
    adminButton: {
      backgroundColor: colors.primary,
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 8,
      marginBottom: 8,
    },
    logoutButton: {
      backgroundColor: colors.textSecondary,
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 8,
      marginBottom: 8,
    },
  });

  return (
    <ScrollView style={styles.container}>
      {/* Profile Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile Information</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>First Name:</Text>
          <Text style={styles.value}>{user?.firstName}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Last Name:</Text>
          <Text style={styles.value}>{user?.lastName}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{user?.email}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Username:</Text>
          <Text style={styles.value}>{user?.username}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Phone:</Text>
          <Text style={styles.value}>{user?.phone}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Role:</Text>
          <Text style={styles.value}>{user?.isAdmin ? 'Administrator' : 'User'}</Text>
        </View>
      </View>

      {/* Update Profile */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Update Profile</Text>
        
        <TextInput
          style={styles.input}
          placeholder="New Username"
          placeholderTextColor={colors.textSecondary}
          value={newUsername}
          onChangeText={setNewUsername}
          autoCapitalize="none"
        />
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="New Password (optional)"
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
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Confirm New Password"
            placeholderTextColor={colors.textSecondary}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity 
            style={styles.passwordToggle}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? (
              <EyeOff size={20} color={colors.textSecondary} />
            ) : (
              <Eye size={20} color={colors.textSecondary} />
            )}
          </TouchableOpacity>
        </View>

        {isEditing ? (
          <>
            <TouchableOpacity style={styles.button} onPress={handleUpdateProfile}>
              <Text style={styles.buttonText}>Save Changes</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.editButton} 
              onPress={() => {
                setIsEditing(false);
                setNewUsername(user?.username || '');
                setNewPassword('');
                setConfirmPassword('');
              }}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={styles.button} onPress={() => setIsEditing(true)}>
            <Text style={styles.buttonText}>Edit Profile</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Admin Panel (only for admin users) */}
      {user?.isAdmin && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Administration</Text>
          <TouchableOpacity 
            style={styles.adminButton} 
            onPress={() => setShowAdminPanel(true)}
          >
            <Shield size={20} color="#fff" />
            <Text style={styles.buttonText}>Admin Panel</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Logout Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Session</Text>
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}
        >
          <LogOut size={20} color={colors.text} />
          <Text style={[styles.buttonText, { color: colors.text }]}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Danger Zone */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Danger Zone</Text>
        <TouchableOpacity style={styles.dangerButton} onPress={handleDeleteAccount}>
          <Text style={styles.buttonText}>Delete My Account</Text>
        </TouchableOpacity>
      </View>

      {/* Admin Panel Modal */}
      <Modal
        visible={showAdminPanel}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <AdminPanel onClose={() => setShowAdminPanel(false)} />
      </Modal>
    </ScrollView>
  );
}

// AdminPanel component
const AdminPanel = ({ onClose }: { onClose: () => void }) => {
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
    backButton: {
      padding: 8,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginLeft: 16,
      flex: 1,
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
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setSelectedUser(null)}
          >
            <ArrowLeft size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Reset Password</Text>
        </View>

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
        <TouchableOpacity 
          style={styles.backButton}
          onPress={onClose}
        >
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

            <Text style={styles.userInfo}>Username: {user.username}</Text>
            <Text style={styles.userInfo}>Email: {user.email}</Text>
            <Text style={styles.userInfo}>Phone: {user.phone}</Text>
            <Text style={styles.userInfo}>
              Joined: {new Date(user.createdAt).toLocaleDateString()}
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
};