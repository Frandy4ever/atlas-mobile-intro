import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface AppLogoProps {
  size?: number;
  showText?: boolean;
  textSize?: number;
}

const AppLogo: React.FC<AppLogoProps> = ({ 
  size = 80, 
  showText = true,
  textSize = 28 
}) => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#3b82f6', '#10b981', '#f59e0b']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.logoGradient,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          }
        ]}
      >
        <Text style={[styles.logoText, { fontSize: size * 0.3 }]}>
          Atlas{'\n'}Fitness
        </Text>
      </LinearGradient>
      {showText && (
        <Text style={[styles.appName, { fontSize: textSize }]}>
          Atlas Fitness
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  logoGradient: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoText: {
    color: '#ffffff',
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  appName: {
    fontWeight: '700',
    color: '#10b981',
    marginTop: 16,
  },
});

export default AppLogo;