import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter, Link } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Lock, ArrowRight } from 'lucide-react-native';
import api from '../../lib/api';

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Błąd", "Wprowadź nazwę użytkownika i hasło.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('token/', { 
        username: username, 
        password: password 
      });
      
      const { access, refresh } = response.data;

      await SecureStore.setItemAsync('userToken', access);
      if (refresh) {
        await SecureStore.setItemAsync('refreshToken', refresh);
      }

      Alert.alert("Sukces", "Zalogowano pomyślnie!");
      router.replace('/(tabs)');
      
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.detail || "Nieprawidłowe dane logowania.";
      Alert.alert("Błąd logowania", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} bounces={false}>
        <View className="flex-1 bg-white">
          <View className="h-[40%] w-full relative">
             <Image 
                source={{ uri: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=2070&auto=format&fit=crop" }} 
                className="w-full h-full"
                resizeMode="cover"
             />
             <LinearGradient colors={['transparent', '#ffffff']} className="absolute bottom-0 left-0 right-0 h-32" />
          </View>

          <View className="flex-1 px-8 -mt-10 bg-white rounded-t-[40px]">
             <Text className="text-3xl font-bold text-stone-900 text-center mt-8 mb-2">Witaj ponownie!</Text>
             <Text className="text-stone-500 text-center mb-10">Zaloguj się, aby planować swój dzień.</Text>

             <View className="space-y-4">
                <View className="flex-row items-center border border-stone-200 rounded-2xl px-4 py-3 bg-stone-50 mb-4">
                    <User size={20} color="#a8a29e" style={{ marginRight: 12 }} />
                    <TextInput 
                        placeholder="Nazwa użytkownika"
                        className="flex-1 text-stone-800 text-base py-1"
                        autoCapitalize="none"
                        value={username}
                        onChangeText={setUsername}
                    />
                </View>

                <View className="flex-row items-center border border-stone-200 rounded-2xl px-4 py-3 bg-stone-50 mb-6">
                    <Lock size={20} color="#a8a29e" style={{ marginRight: 12 }} />
                    <TextInput 
                        placeholder="Hasło"
                        className="flex-1 text-stone-800 text-base py-1"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                    />
                </View>

                <TouchableOpacity 
                    onPress={handleLogin}
                    disabled={loading}
                    className={`bg-rose-600 rounded-2xl py-4 flex-row justify-center items-center shadow-lg mt-4 ${loading ? 'opacity-70' : ''}`}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <>
                            <Text className="text-white font-bold text-lg mr-2">Zaloguj się</Text>
                            <ArrowRight color="white" size={20} />
                        </>
                    )}
                </TouchableOpacity>
             </View>

             <View className="flex-row justify-center mt-8 pb-10">
                <Text className="text-stone-500">Nie masz konta? </Text>
                <Link href="/auth/register" asChild>
                    <TouchableOpacity>
                        <Text className="text-rose-600 font-bold">Zarejestruj się</Text>
                    </TouchableOpacity>
                </Link>
             </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}