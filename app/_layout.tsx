import { Tabs } from "expo-router";
import { Text } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ActivitiesProvider } from "../src/context/ActivitiesContext";
import { ThemeProvider } from "../src/context/ThemeContext";

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <ActivitiesProvider>
          <Tabs
            screenOptions={{
              headerShown: true,
              tabBarStyle: {
                backgroundColor: "#fff",
              },
            }}
          >
            <Tabs.Screen
              name="index"
              options={{
                title: "Activities",
                tabBarLabel: "Home",
                tabBarIcon: () => <Text>📋</Text>,
              }}
            />
            <Tabs.Screen
              name="stats"
              options={{
                title: "Statistics",
                tabBarLabel: "Stats",
                tabBarIcon: () => <Text>📊</Text>,
              }}
            />
            <Tabs.Screen
              name="add"
              options={{
                title: "Add Activity",
                href: null,
              }}
            />
          </Tabs>
        </ActivitiesProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}