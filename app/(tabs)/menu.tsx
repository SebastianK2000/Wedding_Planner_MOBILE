import React, { useState, useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
    Settings, LogOut, ChevronRight, 
    Camera, Music, Flower, Car, Building2,
    HelpCircle, FileText
} from 'lucide-react-native';

const MENU_ITEMS = [
    { 
        title: "Usługodawcy", 
        items: [
            { icon: Building2, label: "Sale weselne", color: "text-yellow-600", bg: "bg-yellow-100" },
            { icon: Camera, label: "Fotograf / Wideo", color: "text-blue-500", bg: "bg-blue-100" },
            { icon: Music, label: "Oprawa muzyczna", color: "text-purple-500", bg: "bg-purple-100" },
            { icon: Flower, label: "Florystka / Dekoracje", color: "text-rose-500", bg: "bg-rose-100" },
            { icon: Car, label: "Transport", color: "text-orange-500", bg: "bg-orange-100" },
        ]
    },
    {
        title: "Aplikacja",
        items: [
            { icon: HelpCircle, label: "Pomoc i FAQ", color: "text-stone-600", bg: "bg-stone-100" },
            { icon: Settings, label: "Ustawienia konta", color: "text-stone-600", bg: "bg-stone-100" },
        ]
    }
];

export default function MenuScreen() {
  const router = useRouter();
  const [userData, setUserData] = useState({ name: "Gość", daysLeft: 224 });

  // Ładowanie danych użytkownika przy każdym wejściu na zakładkę
  useFocusEffect(
    useCallback(() => {
        const loadUser = async () => {
            try {
                const userStr = await AsyncStorage.getItem("user");
                if (userStr) {
                    const user = JSON.parse(userStr);
                    setUserData({
                        name: user.fullname || user.email || "Anna & Tomasz",
                        daysLeft: 224 // Tutaj w przyszłości obliczanie dni z daty ślubu
                    });
                }
            } catch (e) {
                console.log("Błąd ładowania usera w menu", e);
            }
        };
        loadUser();
    }, [])
  );

  const handlePress = (label: string) => {
      if (label.includes("Fotograf")) router.push("/photographer");
      else if (label.includes("muzyczna")) router.push("/music");
      else if (label.includes("Florystka")) router.push("/florist");
      else if (label.includes("Transport")) router.push("/transport");
      else if (label.includes("Sale")) router.push("/venues");
      else if (label.includes("FAQ")) router.push("/faq");
      else if (label.includes("Ustawienia")) router.push("/settings");
      else if (label.includes("Poradnik")) router.push("/guide");
      else Alert.alert("Wkrótce", `Moduł "${label}" jest w trakcie budowy!`);
  };

  const handleLogout = () => {
      Alert.alert("Wyloguj", "Czy na pewno chcesz się wylogować?", [
          { text: "Anuluj", style: "cancel" },
          { 
            text: "Wyloguj", 
            style: "destructive", 
            onPress: async () => {
                try {
                    // Czyścimy tokeny i dane
                    await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user']);
                    // Przekierowanie do logowania (zastępując historię)
                    router.replace("/auth/login");
                } catch (e) {
                    console.error("Błąd wylogowywania:", e);
                }
            } 
          }
      ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-stone-50">
      <ScrollView className="flex-1">
        
        {/* Profil Użytkownika */}
        <View className="bg-white p-6 mb-6 border-b border-stone-200 items-center">
            <View className="w-24 h-24 rounded-full bg-stone-200 mb-4 overflow-hidden border-4 border-rose-100">
                <Image 
                    source={{ uri: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop" }} 
                    className="w-full h-full"
                />
            </View>
            <Text className="text-xl font-bold text-stone-900">{userData.name}</Text>
            <Text className="text-stone-500">Ślub za {userData.daysLeft} dni</Text>
        </View>

        {/* Sekcje Menu */}
        <View className="px-4 pb-4">
            {MENU_ITEMS.map((section, idx) => (
                <View key={idx} className="mb-6">
                    <Text className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-3 ml-1">
                        {section.title}
                    </Text>
                    <View className="bg-white rounded-2xl overflow-hidden border border-stone-100 shadow-sm">
                        {section.items.map((item, itemIdx) => (
                            <TouchableOpacity 
                                key={itemIdx}
                                onPress={() => handlePress(item.label)}
                                className={`flex-row items-center p-4 active:bg-stone-50 ${itemIdx !== section.items.length - 1 ? 'border-b border-stone-100' : ''}`}
                            >
                                <View className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${item.bg}`}>
                                    <item.icon size={20} className={item.color} />
                                </View>
                                <Text className="flex-1 font-medium text-stone-700 text-base">
                                    {item.label}
                                </Text>
                                <ChevronRight size={20} className="text-stone-300" />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            ))}
        </View>

        {/* Przycisk Wyloguj */}
        <View className="px-4 pb-10">
            <TouchableOpacity 
                onPress={handleLogout}
                className="bg-white flex-row items-center p-4 rounded-2xl border border-stone-100 shadow-sm active:bg-stone-50"
            >
                <View className="w-10 h-10 rounded-full items-center justify-center mr-4 bg-red-100">
                    <LogOut size={20} className="text-red-500" />
                </View>
                <Text className="flex-1 font-medium text-red-500 text-base">
                    Wyloguj się
                </Text>
                <ChevronRight size={20} className="text-stone-300" />
            </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}