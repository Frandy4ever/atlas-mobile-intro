import { Tabs } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ActivitiesProvider } from "../src/context/ActivitiesContext";

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ActivitiesProvider>
        <Tabs>
          <Tabs.Screen
            name="index"
            options={{
              title: "Activities",
              tabBarLabel: "Home",
              tabBarIcon: () => "📋",
            }}
          />
          <Tabs.Screen
            name="stats"
            options={{
              title: "Statistics",
              tabBarLabel: "Stats",
              tabBarIcon: () => "📊",
            }}
          />
          <Tabs.Screen
            name="add"
            options={{
              title: "Add Activity",
              href: null, // Hide from tabs
            }}
          />
        </Tabs>
      </ActivitiesProvider>
    </GestureHandlerRootView>
  );
}