import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Eye, EyeOff, HelpCircle, Moon, Sun } from 'lucide-react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../src/context/ThemeContext';
import { useAuth } from '../src/context/AuthContext';

export default function LoginScreen() {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [forgotPasswordModal, setForgotPasswordModal] = useState(false);
  const [resetPasswordModal, setResetPasswordModal] = useState(false);
  const [resetUsername, setResetUsername] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmittingReset, setIsSubmittingReset] = useState(false);
  const [isCompletingReset, setIsCompletingReset] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  const { colors } = useTheme();
  const { user, login, requestPasswordReset, completePasswordReset, passwordResetRequests, getPendingResetRequests } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user.isAdmin) {
      checkPendingRequests();
    }
  }, [user]);

  const checkPendingRequests = async () => {
    const pendingRequests = await getPendingResetRequests();
    if (pendingRequests.length > 0) {
      Alert.alert(
        "Pending Password Reset Requests",
        `You have ${pendingRequests.length} pending password reset request${pendingRequests.length !== 1 ? 's' : ''}.`,
        [
          { text: "View Later", style: "cancel" },
          {
            text: "View Now",
            style: "default",
            onPress: () => {
              router.replace('/admin' as any);
            }
          },
        ]
      );
    }
  };

  const handleLogin = async () => {
    if (!usernameOrEmail.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    const success = await login({ usernameOrEmail, password });
    setIsLoading(false);
    
    if (success) {
      setTimeout(() => {
        router.replace('/' as any);
      }, 1000);
    }
  };

  const handleForgotPassword = () => {
    setForgotPasswordModal(true);
  };

  const handleSubmitResetRequest = async () => {
    if (!resetUsername.trim() || !resetEmail.trim()) {
      Alert.alert('Error', 'Please enter both username and email');
      return;
    }

    setIsSubmittingReset(true);
    
    const approvedRequest = passwordResetRequests.find(
      req => req.username === resetUsername && 
             req.email === resetEmail && 
             req.status === 'approved'
    );

    if (approvedRequest) {
      setIsSubmittingReset(false);
      setForgotPasswordModal(false);
      setResetPasswordModal(true);
      return;
    }

    const success = await requestPasswordReset(resetUsername, resetEmail);
    setIsSubmittingReset(false);

    if (success) {
      setForgotPasswordModal(false);
      setResetUsername('');
      setResetEmail('');
      Alert.alert(
        'Request Submitted',
        'Your password reset request has been sent to the administrator. You will be notified when it is approved.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  const handleCompletePasswordReset = async () => {
    if (!newPassword.trim() || !confirmNewPassword.trim()) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setIsCompletingReset(true);
    const success = await completePasswordReset(resetUsername, resetEmail, newPassword);
    setIsCompletingReset(false);

    if (success) {
      setResetPasswordModal(false);
      setResetUsername('');
      setResetEmail('');
      setNewPassword('');
      setConfirmNewPassword('');
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const bgColor = isDarkMode ? '#020617' : '#f8fafc';
  const cardBg = isDarkMode ? '#1e293b' : '#ffffff';
  const borderColor = isDarkMode ? '#334155' : '#e2e8f0';
  const textColor = isDarkMode ? '#f8fafc' : '#0f172a';
  const secondaryTextColor = isDarkMode ? '#94a3b8' : '#64748b';
  const inputBg = isDarkMode ? '#1e293b' : '#f1f5f9';

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: bgColor,
    },
    scrollContent: {
      flexGrow: 1,
      padding: 20,
      justifyContent: 'center',
    },
    themeToggle: {
      position: 'absolute',
      top: 50,
      right: 20,
      zIndex: 10,
      backgroundColor: cardBg,
      borderRadius: 30,
      padding: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      borderWidth: 1,
      borderColor: borderColor,
    },
    header: {
      alignItems: 'center',
      marginBottom: 40,
    },
    logoContainer: {
      alignItems: 'center',
    },
    logo: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: '#ffffff',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 8,
      borderWidth: 2,
      borderColor: '#e2e8f0',
    },
    appName: {
      fontSize: 28,
      fontWeight: '700',
      color: '#10b981',
    },
    inputContainer: {
      position: 'relative',
      marginBottom: 16,
    },
    input: {
      backgroundColor: inputBg,
      borderWidth: 1,
      borderColor: borderColor,
      borderRadius: 8,
      padding: 16,
      fontSize: 16,
      color: textColor,
      paddingRight: 50,
    },
    inputValid: {
      borderColor: '#10b981',
    },
    inputInvalid: {
      borderColor: '#b91c1c',
    },
    passwordToggle: {
      position: 'absolute',
      right: 16,
      top: 16,
      zIndex: 1,
    },
    button: {
      backgroundColor: '#10b981',
      padding: 16,
      borderRadius: 8,
      alignItems: 'center',
      marginBottom: 16,
    },
    buttonDisabled: {
      backgroundColor: '#475569',
    },
    buttonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    linkContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 20,
    },
    linkText: {
      color: secondaryTextColor,
      fontSize: 16,
    },
    link: {
      color: '#3b82f6',
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 4,
    },
    forgotPasswordContainer: {
      alignItems: 'center',
      marginTop: 16,
    },
    forgotPasswordButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 8,
    },
    forgotPasswordText: {
      color: '#3b82f6',
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 6,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: cardBg,
      borderRadius: 16,
      padding: 24,
      width: '85%',
      maxWidth: 400,
      borderWidth: 1,
      borderColor: borderColor,
    },
    modalTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: textColor,
      marginBottom: 16,
      textAlign: 'center',
    },
    modalDescription: {
      fontSize: 14,
      color: secondaryTextColor,
      marginBottom: 20,
      textAlign: 'center',
    },
    modalButton: {
      backgroundColor: '#10b981',
      padding: 14,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 8,
    },
    modalCancelButton: {
      backgroundColor: '#475569',
      padding: 14,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 8,
    },
    modalButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    errorText: {
      fontSize: 12,
      color: '#f87171',
      marginBottom: 8,
    },
    validText: {
      fontSize: 12,
      color: '#10b981',
      marginBottom: 8,
    },
    requirement: {
      fontSize: 12,
      color: secondaryTextColor,
      marginBottom: 8,
      marginTop: -8,
    },
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Theme Toggle Button */}
      <TouchableOpacity style={styles.themeToggle} onPress={toggleTheme}>
        {isDarkMode ? (
          <Sun size={24} color="#f59e0b" />
        ) : (
          <Moon size={24} color="#0f172a" />
        )}
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <MaskedView
                maskElement={
                  <Text style={{ 
                    fontSize: 48, 
                    fontWeight: 'bold',
                    backgroundColor: 'transparent'
                  }}>
                    AF
                  </Text>
                }
              >
                <LinearGradient
                  colors={['#3b82f6', '#10b981', '#f59e0b']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ width: 80, height: 60 }}
                />
              </MaskedView>
            </View>
            <Text style={styles.appName}>Atlas Fitness</Text>
          </View>
        </View>
        
        <TextInput
          style={styles.input}
          placeholder="Username or Email"
          placeholderTextColor={secondaryTextColor}
          value={usernameOrEmail}
          onChangeText={setUsernameOrEmail}
          autoCapitalize="none"
          autoCorrect={false}
        />
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={secondaryTextColor}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.passwordToggle} onPress={togglePasswordVisibility}>
            {showPassword ? (
              <EyeOff size={20} color={secondaryTextColor} />
            ) : (
              <Eye size={20} color={secondaryTextColor} />
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.forgotPasswordContainer}
          onPress={handleForgotPassword}
        >
          <View style={styles.forgotPasswordButton}>
            <HelpCircle size={16} color="#3b82f6" />
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Text>
        </TouchableOpacity>
        
        <View style={styles.linkContainer}>
          <Text style={styles.linkText}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => router.push('/register' as any)}>
            <Text style={styles.link}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={forgotPasswordModal}
        transparent
        animationType="fade"
        onRequestClose={() => setForgotPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reset Password</Text>
            <Text style={styles.modalDescription}>
              Enter your username and email. If your reset request has been approved, you'll be able to set a new password.
            </Text>
            
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor={secondaryTextColor}
              value={resetUsername}
              onChangeText={setResetUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />
            
            <TextInput
              style={[styles.input, { marginBottom: 20 }]}
              placeholder="Email"
              placeholderTextColor={secondaryTextColor}
              value={resetEmail}
              onChangeText={setResetEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
            />
            
            <TouchableOpacity
              style={[styles.modalButton, isSubmittingReset && styles.buttonDisabled]}
              onPress={handleSubmitResetRequest}
              disabled={isSubmittingReset}
            >
              <Text style={styles.modalButtonText}>
                {isSubmittingReset ? 'Checking...' : 'Continue'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => {
                setForgotPasswordModal(false);
                setResetUsername('');
                setResetEmail('');
              }}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={resetPasswordModal}
        transparent
        animationType="fade"
        onRequestClose={() => setResetPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set New Password</Text>
            <Text style={styles.modalDescription}>
              Your password reset request has been approved! Please enter your new password.
            </Text>
            
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="New Password"
                placeholderTextColor={secondaryTextColor}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNewPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity 
                style={styles.passwordToggle} 
                onPress={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <EyeOff size={20} color={secondaryTextColor} />
                ) : (
                  <Eye size={20} color={secondaryTextColor} />
                )}
              </TouchableOpacity>
            </View>
            <Text style={styles.requirement}>
              Must include: letter, number, special character (@#!&$*), no consecutive characters
            </Text>
            
            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.input,
                  confirmNewPassword.length > 0 && 
                  (newPassword === confirmNewPassword ? styles.inputValid : styles.inputInvalid)
                ]}
                placeholder="Confirm New Password"
                placeholderTextColor={secondaryTextColor}
                value={confirmNewPassword}
                onChangeText={setConfirmNewPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity 
                style={styles.passwordToggle} 
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} color={secondaryTextColor} />
                ) : (
                  <Eye size={20} color={secondaryTextColor} />
                )}
              </TouchableOpacity>
            </View>

            {newPassword !== confirmNewPassword && confirmNewPassword.length > 0 && (
              <Text style={styles.errorText}>Passwords do not match</Text>
            )}
            {newPassword === confirmNewPassword && confirmNewPassword.length > 0 && newPassword.length > 0 && (
              <Text style={styles.validText}>Passwords match</Text>
            )}
            
            <TouchableOpacity
              style={[
                styles.modalButton, 
                (isCompletingReset || newPassword !== confirmNewPassword || !newPassword) && styles.buttonDisabled
              ]}
              onPress={handleCompletePasswordReset}
              disabled={isCompletingReset || newPassword !== confirmNewPassword || !newPassword}
            >
              <Text style={styles.modalButtonText}>
                {isCompletingReset ? 'Resetting...' : 'Reset Password'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => {
                setResetPasswordModal(false);
                setNewPassword('');
                setConfirmNewPassword('');
                setResetUsername('');
                setResetEmail('');
              }}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}