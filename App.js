// App.js
import React from "react";
import { View, Text, Platform } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import ThemeToggle from "./components/ThemeToggle";

import HomeScreen from "./screens/HomeScreen";
import AddCosplayScreen from "./screens/AddCosplayScreen";
import EditCosplayScreen from "./screens/EditCosplayScreen";
import AddEventScreen from "./screens/AddEventScreen";
import AllEventsScreen from "./screens/AllEventsScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const commonHeaderOptions = (theme) => ({
  headerStyle: { backgroundColor: theme.primary },
  headerTintColor: "#fff",
  headerTitleStyle: { fontWeight: "bold" },
  headerRight: () => <ThemeToggle />,
  headerRightContainerStyle: { paddingRight: 16 },
});

function HomeStack() {
  const { theme } = useTheme();
  return (
    <Stack.Navigator screenOptions={commonHeaderOptions(theme)}>
      <Stack.Screen name="CosplayList" component={HomeScreen} options={{ title: "🧵 Cosplay Tracker" }} />
      <Stack.Screen name="Edit Cosplay" component={EditCosplayScreen} options={{ title: "Edit Cosplay" }} />
      <Stack.Screen name="Add Event" component={AddEventScreen} options={{ title: "Add Upcoming Event" }} />
    </Stack.Navigator>
  );
}

function AddCosplayStack() {
  const { theme } = useTheme();
  return (
    <Stack.Navigator screenOptions={commonHeaderOptions(theme)}>
      <Stack.Screen name="AddCosplayForm" component={AddCosplayScreen} options={{ title: "Add New Cosplay" }} />
    </Stack.Navigator>
  );
}

function EventsStack() {
  const { theme } = useTheme();
  return (
    <Stack.Navigator screenOptions={commonHeaderOptions(theme)}>
      <Stack.Screen name="AllEvents" component={AllEventsScreen} options={{ title: "📅 Upcoming Events" }} />
    </Stack.Navigator>
  );
}

function AppTabs() {
  const { theme } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.surfaceLight,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textTertiary,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tab.Screen
        name="HomTab"
        component={HomeStack}
        options={{
          tabBarLabel: "Cosplays",
          tabBarIcon: ({ focused }) => (
            <View>
              <Text style={{ fontSize: 20 }}>{focused ? "🧵" : "🪡"}</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="AddTab"
        component={AddCosplayStack}
        options={{
          tabBarLabel: "Add Cosplay",
          tabBarIcon: ({ focused }) => (
            <View>
              <Text style={{ fontSize: 20 }}>{focused ? "➕" : "✚"}</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="EventsTab"
        component={EventsStack}
        options={{
          tabBarLabel: "Events",
          tabBarIcon: ({ focused }) => (
            <View>
              <Text style={{ fontSize: 20 }}>{focused ? "📅" : "🗓️"}</Text>
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  React.useEffect(() => {
    if (Platform.OS === "web") {
      document.body.style.overflow = "auto";
    }
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <NavigationContainer>
          <AppTabs />
        </NavigationContainer>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}