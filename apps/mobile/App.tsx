import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./src/lib/supabase";
import type { MainTabParamList, RootStackParamList } from "./src/navigation/types";
import { AuthScreen } from "./src/screens/AuthScreen";
import { FollowingScreen } from "./src/screens/FollowingScreen";
import { ProfileSearchScreen } from "./src/screens/ProfileSearchScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import { TodayScreen } from "./src/screens/TodayScreen";
import { ComposeScreen } from "./src/screens/ComposeScreen";
import { UserProfileScreen } from "./src/screens/UserProfileScreen";

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#0a0a0a",
    card: "#0a0a0a",
    border: "#2a2a2a",
    primary: "#00e676",
    text: "#fafafa",
  },
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#0a0a0a" },
        headerTintColor: "#fafafa",
        tabBarStyle: {
          backgroundColor: "#0a0a0a",
          borderTopColor: "#2a2a2a",
        },
        tabBarActiveTintColor: "#00e676",
        tabBarInactiveTintColor: "#737373",
      }}
    >
      <Tab.Screen name="Following" component={FollowingScreen} />
      <Tab.Screen
        name="ProfileSearch"
        component={ProfileSearchScreen}
        options={{ title: "Search", tabBarLabel: "Search" }}
      />
      <Tab.Screen name="Today" component={TodayScreen} />
      <Tab.Screen name="Post" component={ComposeScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function MainStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#0a0a0a" },
        headerTintColor: "#fafafa",
        contentStyle: { backgroundColor: "#0a0a0a" },
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="UserProfile"
        component={UserProfileScreen}
        options={({ route }) => ({
          title: `@${route.params.handle}`,
        })}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
    });
    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  const refreshSession = useCallback(() => {
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
    });
  }, []);

  if (!ready) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#0a0a0a",
        }}
      >
        <ActivityIndicator color="#00e676" size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={navTheme}>
        <StatusBar style="light" />
        {session ? (
          <MainStack />
        ) : (
          <AuthScreen onAuthed={refreshSession} />
        )}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
