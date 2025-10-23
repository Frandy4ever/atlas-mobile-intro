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
import { Eye, EyeOff, Moon, Sun } from 'lucide-react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
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
  const [isDarkMode, setIsDarkMode] = useState(true);
  
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
    const cleaned = text.replace(/\D/g, '');
    const limited = cleaned.slice(0, 10);
    setPhone(limited);
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);
  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const isUsernameValid = /^[a-zA-Z0-9]{3,15}$/.test(username);

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
    requirement: {
      fontSize: 12,
      color: secondaryTextColor,
      marginBottom: 8,
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
    nameContainer: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 16,
    },
    nameInput: {
      flex: 1,
      backgroundColor: inputBg,
      borderWidth: 1,
      borderColor: borderColor,
      borderRadius: 8,
      padding: 16,
      fontSize: 16,
      color: textColor,
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
        
        <View style={styles.nameContainer}>
          <TextInput
            style={styles.nameInput}
            placeholder="First Name"
            placeholderTextColor={secondaryTextColor}
            value={firstName}
            onChangeText={setFirstName}
            autoCapitalize="words"
            autoCorrect={false}
          />
          <TextInput
            style={styles.nameInput}
            placeholder="Last Name"
            placeholderTextColor={secondaryTextColor}
            value={lastName}
            onChangeText={setLastName}
            autoCapitalize="words"
            autoCorrect={false}
          />
        </View>
        
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={secondaryTextColor}
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
          placeholderTextColor={secondaryTextColor}
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
            placeholderTextColor={secondaryTextColor}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.passwordToggle} onPress={toggleConfirmPasswordVisibility}>
            {showConfirmPassword ? (
              <EyeOff size={20} color={secondaryTextColor} />
            ) : (
              <Eye size={20} color={secondaryTextColor} />
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
          placeholderTextColor={secondaryTextColor}
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