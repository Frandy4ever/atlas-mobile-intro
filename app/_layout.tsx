import { Tabs, usePathname, Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ClipboardList, BarChart3, Archive, Settings, Palette } from "lucide-react-native";
import { ActivitiesProvider } from "../src/context/ActivitiesContext";
import { ThemeProvider, useTheme } from "../src/context/ThemeContext";
import { ArchiveProvider } from "../src/context/ArchiveContext";
import { AuthProvider, useAuth } from "../src/context/AuthContext";
import { TouchableOpacity, Text, Alert } from "react-native";
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

// Separate component for authenticated layout to maintain hook order
function AuthenticatedLayout() {
  const { colors } = useTheme();
  const { user, logout } = useAuth();
  const [showThemeSelector, setShowThemeSelector] = useState(false);

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

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: true,
          tabBarStyle: {
            backgroundColor: colors.cardBackground,
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          headerRight: () => (
            <TouchableOpacity onPress={handleLogout} style={{ marginRight: 16 }}>
              <Text style={{ color: colors.primary, fontWeight: '600' }}>
                {(user as any)?.firstName || (user as any)?.name || user?.email || 'User'}
              </Text>
            </TouchableOpacity>
          ),
        }}
      >
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
          name="admin"
          options={{
            title: "Admin Panel",
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
  const { user, isLoading } = useAuth(); // Call hooks at the top level
  
  // Check if we're on an auth screen
  const isAuthScreen = pathname === '/login' || pathname === '/register';

  // For auth screens or when not authenticated, use Stack navigation
  if (isAuthScreen || (!isLoading && !user)) {
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

  // For authenticated screens, use the authenticated layout
  return <AuthenticatedLayout />;
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