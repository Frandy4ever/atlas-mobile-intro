import React, { useState } from 'react';
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
} from 'react-native';
import { useRouter } from 'expo-router';
import { Eye, EyeOff } from 'lucide-react-native';
import { useTheme } from '../src/context/ThemeContext';
import { useAuth } from '../src/context/AuthContext';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { colors } = useTheme();
  const { register } = useAuth();
  const router = useRouter();

  const handleRegister = async () => {
    if (!email.trim() || !username.trim() || !password.trim() || !confirmPassword.trim() || !phone.trim() || !firstName.trim() || !lastName.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setIsLoading(true);
    const success = await register({ 
      email, 
      username, 
      password, 
      firstName, 
      lastName, 
      phone 
    });
    setIsLoading(false);
    
    if (success) {
      router.replace('/' as any);
    }
  };

  const formatPhone = (text: string) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');
    // Limit to 10 digits
    const limited = cleaned.slice(0, 10);
    setPhone(limited);
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      flexGrow: 1,
      padding: 20,
      justifyContent: 'center',
    },
    title: {
      fontSize: 32,
      fontWeight: '700',
      color: colors.primary,
      textAlign: 'center',
      marginBottom: 40,
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
      padding: 16,
      fontSize: 16,
      color: colors.text,
      paddingRight: 50, // Space for the eye icon
    },
    inputValid: {
      borderColor: colors.primary, // Use primary color for valid state
    },
    inputInvalid: {
      borderColor: colors.danger,
    },
    passwordToggle: {
      position: 'absolute',
      right: 16,
      top: 16,
      zIndex: 1,
    },
    button: {
      backgroundColor: colors.primary,
      padding: 16,
      borderRadius: 8,
      alignItems: 'center',
      marginBottom: 16,
    },
    buttonDisabled: {
      backgroundColor: colors.textSecondary,
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
      color: colors.textSecondary,
      fontSize: 16,
    },
    link: {
      color: colors.primary,
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 4,
    },
    requirement: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 8,
    },
    errorText: {
      fontSize: 12,
      color: colors.danger,
      marginBottom: 8,
    },
    validText: {
      fontSize: 12,
      color: colors.primary, // Use primary color instead of success
      marginBottom: 8,
    },
    nameContainer: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 16,
    },
    nameInput: {
      flex: 1,
      backgroundColor: colors.inputBackground,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 16,
      fontSize: 16,
      color: colors.text,
    },
  });

  // Validate username format
  const isUsernameValid = /^[a-zA-Z0-9]{3,15}$/.test(username);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Create Account</Text>
        
        {/* Name Fields */}
        <View style={styles.nameContainer}>
          <TextInput
            style={styles.nameInput}
            placeholder="First Name"
            placeholderTextColor={colors.textSecondary}
            value={firstName}
            onChangeText={setFirstName}
            autoCapitalize="words"
            autoCorrect={false}
          />
          <TextInput
            style={styles.nameInput}
            placeholder="Last Name"
            placeholderTextColor={colors.textSecondary}
            value={lastName}
            onChangeText={setLastName}
            autoCapitalize="words"
            autoCorrect={false}
          />
        </View>
        
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={colors.textSecondary}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoCorrect={false}
        />
        
        <TextInput
          style={[
            styles.input,
            username.length > 0 && (isUsernameValid ? styles.inputValid : styles.inputInvalid)
          ]}
          placeholder="Username (3-15 characters, letters & numbers only)"
          placeholderTextColor={colors.textSecondary}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
          maxLength={15}
        />
        {username.length > 0 && !isUsernameValid && (
          <Text style={styles.errorText}>
            Username must be 3-15 characters using only letters and numbers
          </Text>
        )}
        {username.length > 0 && isUsernameValid && (
          <Text style={styles.validText}>Username format is valid</Text>
        )}
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={colors.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.passwordToggle} onPress={togglePasswordVisibility}>
            {showPassword ? (
              <EyeOff size={20} color={colors.textSecondary} />
            ) : (
              <Eye size={20} color={colors.textSecondary} />
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
              confirmPassword.length > 0 && 
              (password === confirmPassword ? styles.inputValid : styles.inputInvalid)
            ]}
            placeholder="Confirm Password"
            placeholderTextColor={colors.textSecondary}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.passwordToggle} onPress={toggleConfirmPasswordVisibility}>
            {showConfirmPassword ? (
              <EyeOff size={20} color={colors.textSecondary} />
            ) : (
              <Eye size={20} color={colors.textSecondary} />
            )}
          </TouchableOpacity>
        </View>
        {password !== confirmPassword && confirmPassword.length > 0 && (
          <Text style={styles.errorText}>Passwords do not match</Text>
        )}
        {password === confirmPassword && confirmPassword.length > 0 && (
          <Text style={styles.validText}>Passwords match</Text>
        )}
        
        <TextInput
          style={styles.input}
          placeholder="Phone (10 digits)"
          placeholderTextColor={colors.textSecondary}
          value={phone}
          onChangeText={formatPhone}
          keyboardType="phone-pad"
          maxLength={10}
        />
        
        <TouchableOpacity
          style={[
            styles.button, 
            (isLoading || password !== confirmPassword || !isUsernameValid || username.length === 0 || firstName.length === 0 || lastName.length === 0) && styles.buttonDisabled
          ]}
          onPress={handleRegister}
          disabled={isLoading || password !== confirmPassword || !isUsernameValid || username.length === 0 || firstName.length === 0 || lastName.length === 0}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Text>
        </TouchableOpacity>
        
        <View style={styles.linkContainer}>
          <Text style={styles.linkText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => router.push('/login' as any)}>
            <Text style={styles.link}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}