import { Tabs, usePathname, Stack, useRouter } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ClipboardList, BarChart3, Archive, Settings, Palette, Shield } from "lucide-react-native";
import { ActivitiesProvider } from "../src/context/ActivitiesContext";
import { ThemeProvider, useTheme } from "../src/context/ThemeContext";
import { ArchiveProvider } from "../src/context/ArchiveContext";
import { AuthProvider, useAuth } from "../src/context/AuthContext";
import { TouchableOpacity, Text, Alert, View } from "react-native";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import ThemeSelector from "../src/components/ThemeSelector";
import React, { useState } from "react";

// Suppress keep-awake warnings in development
if (__DEV__) {
  const originalWarn = console.warn;
  const originalError = console.error;
  
  console.warn = (...args) => {
    if (
      args[0]?.includes?.('keep awake') ||
      args[0]?.includes?.('Keep awake')
    ) {
      return;
    }
    originalWarn(...args);
  };
  
  console.error = (...args) => {
    if (
      args[0]?.includes?.('keep awake') ||
      args[0]?.includes?.('Keep awake')
    ) {
      return;
    }
    originalError(...args);
  };
}

// Header Component
function Header({ title }: { title: string }) {
  const { colors } = useTheme();
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleAvatarPress = () => {
    Alert.alert(
      "Account",
      `Hello, ${user?.firstName} ${user?.lastName}!`,
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

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: colors.cardBackground,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    }}>
      {/* App Logo with Gradient Text */}
      <TouchableOpacity 
        onPress={() => router.push('/' as any)}
      >
        <View style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: '#ffffff',
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 4,
          borderWidth: 1,
          borderColor: '#e2e8f0',
        }}>
          <MaskedView
            maskElement={
              <Text style={{ 
                fontSize: 16, 
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
              style={{ width: 30, height: 22 }}
            />
          </MaskedView>
        </View>
      </TouchableOpacity>

      {/* Screen Title */}
      <Text style={{
        flex: 1,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
      }}>
        {title}
      </Text>

      {/* User Avatar with Logout */}
      <TouchableOpacity 
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: colors.secondary,
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onPress={handleAvatarPress}
      >
        <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>
          {user ? getInitials(user.firstName, user.lastName) : 'U'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// Separate component for authenticated layout
function AuthenticatedTabs() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [showThemeSelector, setShowThemeSelector] = useState(false);

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: true,
          header: ({ route, options }) => (
            <Header title={options.title || route.name} />
          ),
          tabBarStyle: {
            backgroundColor: colors.cardBackground,
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
        }}
      >
        {/* Regular User Tabs */}
        <Tabs.Screen
          name="index"
          options={{
            title: "Activities",
            tabBarLabel: "Home",
            tabBarIcon: ({ color, size }) => <ClipboardList color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="stats"
          options={{
            title: "Statistics",
            tabBarLabel: "Stats",
            tabBarIcon: ({ color, size }) => <BarChart3 color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="archive"
          options={{
            title: "Archive",
            tabBarLabel: "Archive",
            tabBarIcon: ({ color, size }) => <Archive color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarLabel: "Settings",
            tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="theme"
          options={{
            title: "Theme",
            tabBarLabel: "Theme",
            tabBarIcon: ({ color, size }) => <Palette color={color} size={size} />,
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              setShowThemeSelector(true);
            },
          }}
        />
        
        {/* Admin Tab - Only show for admin users */}
        {user?.isAdmin && (
          <Tabs.Screen
            name="admin"
            options={{
              title: "Admin",
              tabBarLabel: "Admin",
              tabBarIcon: ({ color, size }) => <Shield color={color} size={size} />,
            }}
          />
        )}
        
        {/* Hidden screens */}
        <Tabs.Screen
          name="add"
          options={{
            title: "Add Activity",
            href: null,
          }}
        />
        <Tabs.Screen
          name="login"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="register"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="user-stats"
          options={{
            href: null,
          }}
        />
      </Tabs>
      <ThemeSelector visible={showThemeSelector} onClose={() => setShowThemeSelector(false)} />
    </>
  );
}

function RootLayoutNav() {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();
  
  // Check if we're on an auth screen
  const isAuthScreen = pathname === '/login' || pathname === '/register';

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#020617' }}>
        <Text style={{ color: '#f8fafc' }}>Loading...</Text>
      </View>
    );
  }

  // For auth screens, use Stack navigation without tabs
  if (isAuthScreen) {
    return (
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
      </Stack>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return (
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="login" />
      </Stack>
    );
  }

  // For authenticated screens, use the authenticated layout
  return <AuthenticatedTabs />;
}

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AuthProvider>
          <ArchiveProvider>
            <ActivitiesProvider>
              <RootLayoutNav />
            </ActivitiesProvider>
          </ArchiveProvider>
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}