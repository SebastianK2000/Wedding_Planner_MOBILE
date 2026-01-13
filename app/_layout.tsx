import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import "../global.css";

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("access_token");
        const inAuthGroup = segments[0] === "auth";

        if (!token && !inAuthGroup) {
          router.replace("/auth/login");
        } 
        else if (token && inAuthGroup) {
          router.replace("/(tabs)");
        }
      } catch (e) {
        console.error("Błąd autoryzacji:", e);
      } finally {
        setIsReady(true);
      }
    };

    if (segments) { 
        checkAuth();
    }
  }, [segments]);

  if (!isReady) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#e11d48" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#ffffff' } }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        
        <Stack.Screen name="auth" options={{ headerShown: false }} />

        <Stack.Screen name="photographer" options={{ headerShown: false }} />
        <Stack.Screen name="music" options={{ headerShown: false }} />
        <Stack.Screen name="florist" options={{ headerShown: false }} />
        <Stack.Screen name="transport" options={{ headerShown: false }} />
        <Stack.Screen name="venues" options={{ headerShown: false }} />
        
        <Stack.Screen name="settings" options={{ headerShown: false }} />
        <Stack.Screen name="faq" options={{ headerShown: false }} />
        <Stack.Screen name="guide" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}