import React, { useState, useEffect } from 'react';
import { View, Text, Switch, TouchableOpacity, ScrollView, Alert, TextInput, Modal, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ArrowLeft, Bell, Moon, Lock, User, Trash2, X, Save, LogOut } from 'lucide-react-native';

export default function SettingsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  
  const [user, setUser] = useState<{ fullname: string; email: string } | null>(null);
  
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
          const userData = JSON.parse(userStr);
          setUser(userData);
          setNewName(userData.fullname || "");
      }

      const notif = await AsyncStorage.getItem('wp_settings_notifications');
      const dark = await AsyncStorage.getItem('wp_settings_darkmode');
      
      if (notif !== null) setNotifications(JSON.parse(notif));
      if (dark !== null) setDarkMode(JSON.parse(dark));

    } catch (e) {
      console.log("Błąd ładowania ustawień", e);
    } finally {
      setLoading(false);
    }
  };

  const toggleNotifications = async (value: boolean) => {
      setNotifications(value);
      await AsyncStorage.setItem('wp_settings_notifications', JSON.stringify(value));
  };

  const toggleDarkMode = async (value: boolean) => {
      setDarkMode(value);
      await AsyncStorage.setItem('wp_settings_darkmode', JSON.stringify(value));
  };

  const handleSaveProfile = async () => {
      if (!user) return;
      
      const updatedUser = { ...user, fullname: newName };
      setUser(updatedUser);
      
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      
      setEditModalVisible(false);
      Alert.alert("Sukces", "Profil został zaktualizowany.");
  };

  const handleLogout = async () => {
      Alert.alert("Wyloguj", "Czy na pewno chcesz się wylogować?", [
          { text: "Anuluj", style: "cancel" },
          { 
            text: "Wyloguj", 
            style: "destructive", 
            onPress: async () => {
                await AsyncStorage.clear();
                router.replace('/auth/login');
            } 
          }
      ]);
  };

  const handleDeleteAccount = () => {
      Alert.alert(
          "Usuń konto", 
          "Ta operacja jest nieodwracalna. Wszystkie Twoje dane zostaną utracone.",
          [
              { text: "Anuluj", style: "cancel" },
              { text: "Usuń", style: "destructive", onPress: () => console.log("Tu byłoby API call do usunięcia") }
          ]
      );
  };

  if (loading) {
      return (
          <SafeAreaView className="flex-1 bg-stone-50 items-center justify-center">
              <ActivityIndicator color="#e11d48" />
          </SafeAreaView>
      );
  }

  return (
    <SafeAreaView className="flex-1 bg-stone-50">
      <View className="px-4 py-2 flex-row items-center border-b border-stone-200 bg-white">
        <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2 bg-stone-100 rounded-full">
          <ArrowLeft size={20} className="text-stone-600" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-stone-900">Ustawienia</Text>
      </View>

      <ScrollView className="p-4">
        
        <View className="flex-row items-center bg-white p-4 rounded-2xl border border-stone-100 mb-6 shadow-sm">
            <View className="w-14 h-14 bg-rose-100 rounded-full items-center justify-center mr-4">
                <Text className="text-xl font-bold text-rose-600">
                    {user?.fullname?.charAt(0) || "U"}
                </Text>
            </View>
            <View>
                <Text className="text-lg font-bold text-stone-900">{user?.fullname || "Gość"}</Text>
                <Text className="text-stone-500 text-sm">{user?.email || "Brak e-maila"}</Text>
            </View>
        </View>

        <Text className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-2 ml-1">Konto</Text>
        <View className="bg-white rounded-2xl mb-6 overflow-hidden border border-stone-100">
           <TouchableOpacity 
                onPress={() => setEditModalVisible(true)}
                className="p-4 border-b border-stone-100 flex-row items-center"
           >
              <User size={20} className="text-stone-500 mr-3" />
              <Text className="flex-1 font-medium text-stone-700">Edytuj profil</Text>
           </TouchableOpacity>
           <TouchableOpacity className="p-4 flex-row items-center">
              <Lock size={20} className="text-stone-500 mr-3" />
              <Text className="flex-1 font-medium text-stone-700">Zmień hasło</Text>
           </TouchableOpacity>
        </View>

        <Text className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-2 ml-1">Aplikacja</Text>
        <View className="bg-white rounded-2xl mb-6 overflow-hidden border border-stone-100">
           <View className="p-4 border-b border-stone-100 flex-row items-center justify-between">
              <View className="flex-row items-center">
                  <Bell size={20} className="text-stone-500 mr-3" />
                  <Text className="font-medium text-stone-700">Powiadomienia</Text>
              </View>
              <Switch 
                value={notifications} 
                onValueChange={toggleNotifications} 
                trackColor={{ false: '#d6d3d1', true: '#e11d48' }}
              />
           </View>
           <View className="p-4 flex-row items-center justify-between">
              <View className="flex-row items-center">
                  <Moon size={20} className="text-stone-500 mr-3" />
                  <Text className="font-medium text-stone-700">Tryb ciemny</Text>
              </View>
              <Switch 
                 value={darkMode} 
                 onValueChange={toggleDarkMode} 
                 trackColor={{ false: '#d6d3d1', true: '#e11d48' }}
              />
           </View>
        </View>

        <TouchableOpacity 
            onPress={handleLogout}
            className="bg-white p-4 rounded-2xl flex-row items-center border border-stone-200 mb-4"
        >
            <LogOut size={20} className="text-stone-600 mr-3" />
            <Text className="font-bold text-stone-700">Wyloguj się</Text>
        </TouchableOpacity>

        <TouchableOpacity 
            className="bg-red-50 p-4 rounded-2xl flex-row items-center justify-center border border-red-100"
            onPress={handleDeleteAccount}
        >
            <Trash2 size={20} className="text-red-500 mr-2" />
            <Text className="text-red-600 font-bold">Usuń konto</Text>
        </TouchableOpacity>

        <Text className="text-center text-stone-300 text-xs mt-8 pb-8">Build 1.0.3 (2025)</Text>

      </ScrollView>

      <Modal visible={editModalVisible} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-stone-50">
            <View className="bg-white px-4 py-4 flex-row justify-between items-center border-b border-stone-200">
                <Text className="text-lg font-bold text-stone-900">Edytuj profil</Text>
                <TouchableOpacity onPress={() => setEditModalVisible(false)} className="bg-stone-100 p-2 rounded-full">
                    <X size={20} className="text-stone-600" />
                </TouchableOpacity>
            </View>
            
            <View className="p-6">
                <Text className="text-sm font-bold text-stone-600 mb-2 ml-1">Imię i Nazwisko</Text>
                <TextInput 
                    value={newName}
                    onChangeText={setNewName}
                    className="bg-white border border-stone-200 rounded-xl p-4 text-lg text-stone-900 mb-6"
                    placeholder="Wpisz imię i nazwisko"
                />

                <TouchableOpacity 
                    onPress={handleSaveProfile}
                    className="bg-rose-600 w-full py-4 rounded-2xl flex-row items-center justify-center gap-2 shadow-lg shadow-rose-500/20"
                >
                    <Save color="white" size={20} />
                    <Text className="text-white font-bold text-lg">Zapisz zmiany</Text>
                </TouchableOpacity>
            </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}