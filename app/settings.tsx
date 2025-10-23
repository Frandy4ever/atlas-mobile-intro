import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import { useAuth } from "../src/context/AuthContext";
import { useTheme } from "../src/context/ThemeContext";
import { useActivities } from "../src/context/ActivitiesContext";
import { useArchive } from "../src/context/ArchiveContext";
import { Eye, EyeOff, Trash2, User, Mail, Phone, Calendar, LogOut } from "lucide-react-native";

const SettingsScreen: React.FC = () => {
  const { user, updateUser, deleteUser, logout } = useAuth();
  const { deleteAllActivities } = useActivities();
  const { deleteAllArchived } = useArchive();
  const { colors } = useTheme();

  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateProfile = async () => {
    if (!newUsername.trim() && !newPassword.trim()) {
      Alert.alert("Error", "Please enter a new username or password");
      return;
    }

    setIsUpdating(true);
    const success = await updateUser(user!.id, {
      username: newUsername.trim() || undefined,
      password: newPassword.trim() || undefined,
    });
    setIsUpdating(false);

    if (success) {
      setNewUsername("");
      setNewPassword("");
    }
  };

  const handleDeleteAllData = () => {
    Alert.alert(
      "Delete All Data",
      "This will permanently delete all your activities and archived data. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAllActivities();
              await deleteAllArchived();
              Alert.alert("Success", "All data has been deleted");
            } catch (error) {
              Alert.alert("Error", "Failed to delete data");
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This will permanently delete your account and all associated data. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Account",
          style: "destructive",
          onPress: async () => {
            const success = await deleteUser(user!.id);
            if (success) {
              logout();
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: logout,
        },
      ]
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    section: {
      backgroundColor: colors.cardBackground,
      margin: 16,
      padding: 16,
      borderRadius: 12,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 16,
    },
    profileItem: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    profileIcon: {
      marginRight: 12,
    },
    profileText: {
      fontSize: 16,
      color: colors.text,
    },
    inputContainer: {
      position: "relative",
      marginBottom: 16,
    },
    input: {
      backgroundColor: colors.inputBackground,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: colors.text,
      paddingRight: 50,
    },
    passwordToggle: {
      position: "absolute",
      right: 12,
      top: 12,
      zIndex: 1,
    },
    button: {
      backgroundColor: colors.primary,
      padding: 12,
      borderRadius: 8,
      alignItems: "center",
      marginBottom: 8,
    },
    buttonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "600",
    },
    dangerButton: {
      backgroundColor: colors.danger,
      padding: 12,
      borderRadius: 8,
      alignItems: "center",
      marginTop: 8,
    },
    logoutButton: {
      backgroundColor: colors.secondary,
      padding: 12,
      borderRadius: 8,
      alignItems: "center",
      marginBottom: 8,
      flexDirection: "row",
      justifyContent: "center",
      gap: 8,
    },
    dangerButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "600",
    },
    buttonDisabled: {
      backgroundColor: colors.textSecondary,
    },
  });

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={{ color: colors.text, textAlign: "center", marginTop: 20 }}>
          User not found
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Profile Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile Information</Text>
        
        <View style={styles.profileItem}>
          <User size={20} color={colors.textSecondary} style={styles.profileIcon} />
          <Text style={styles.profileText}>
            {user.firstName} {user.lastName}
          </Text>
        </View>
        
        <View style={styles.profileItem}>
          <Mail size={20} color={colors.textSecondary} style={styles.profileIcon} />
          <Text style={styles.profileText}>{user.email}</Text>
        </View>
        
        <View style={styles.profileItem}>
          <User size={20} color={colors.textSecondary} style={styles.profileIcon} />
          <Text style={styles.profileText}>@{user.username}</Text>
        </View>
        
        <View style={styles.profileItem}>
          <Phone size={20} color={colors.textSecondary} style={styles.profileIcon} />
          <Text style={styles.profileText}>{user.phone}</Text>
        </View>
        
        <View style={styles.profileItem}>
          <Calendar size={20} color={colors.textSecondary} style={styles.profileIcon} />
          <Text style={styles.profileText}>
            Joined {new Date(user.createdAt).toLocaleDateString()}
          </Text>
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
        />
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="New Password"
            placeholderTextColor={colors.textSecondary}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!showPassword}
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
          style={[styles.button, (!newUsername.trim() && !newPassword.trim()) && styles.buttonDisabled]}
          onPress={handleUpdateProfile}
          disabled={(!newUsername.trim() && !newPassword.trim()) || isUpdating}
        >
          <Text style={styles.buttonText}>
            {isUpdating ? "Updating..." : "Update Profile"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color="#fff" />
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Danger Zone */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.danger }]}>
          Danger Zone
        </Text>
        
        <TouchableOpacity style={styles.dangerButton} onPress={handleDeleteAllData}>
          <Text style={styles.dangerButtonText}>Delete All Activities</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.dangerButton} onPress={handleDeleteAccount}>
          <Text style={styles.dangerButtonText}>Delete Account</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default SettingsScreen;