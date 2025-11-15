// App.tsx
// Must be the first import to initialize gesture handler on some platforms
import "react-native-gesture-handler";
import "react-native-reanimated"; // ensure babel plugin is set in babel.config.js

import React from "react";
import { View, Text } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";

// Optional store provider — if you created src/store/Store.tsx earlier
// If you don't have StoreProvider, remove this import and the wrapper below.
import { StoreProvider } from "./src/store/Store";

// Example screens (keep or replace with your real ones)
import Dashboard from "./src/screens/Dashboard";
import Transactions from "./src/screens/Transactions";
import Accounts from "./src/screens/Accounts";
import AssetDetail from "./src/screens/AssetDetail";
import Reminders from "./src/screens/Reminders";
import AddReminder from "./src/screens/AddReminder";
import ReminderDetail from "./src/screens/ReminderDetail";
import Auth from "./src/screens/Auth";
import { useStore } from "./src/store/Store";
import { AuthProvider, useAuth } from "./src/store/AuthStore";

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { user, loading: authLoading } = useAuth();
  const { loading } = useStore();
  const colorScheme = "light" as "light" | "dark";

  if (authLoading || loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f6f8fb' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <NavigationContainer
      theme={colorScheme === "dark" ? DarkTheme : DefaultTheme}
    >
              <Stack.Navigator>
                <Stack.Screen
                  name="Dashboard"
                  component={Dashboard}
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="Transactions"
                  component={Transactions}
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="Accounts"
                  component={Accounts}
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="AssetDetail"
                  component={AssetDetail}
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="Reminders"
                  component={Reminders}
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="AddReminder"
                  component={AddReminder}
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="ReminderDetail"
                  component={ReminderDetail}
                  options={{ headerShown: false }}
                />
              </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView>
      <SafeAreaProvider>
        <AuthProvider>
          <StoreProvider>
            <AppNavigator />
          </StoreProvider>
        </AuthProvider>
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
