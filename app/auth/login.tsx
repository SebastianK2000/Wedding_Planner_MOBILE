import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter, Link } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, ArrowRight } from 'lucide-react-native';
import api from '../../lib/api';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
        Alert.alert("Błąd", "Wprowadź email i hasło.");
        return;
    }

    setLoading(true);
    try {
        const response = await api.post('/login/', { email, password });
        
        const { access, refresh, user } = response.data;

        await AsyncStorage.multiSet([
            ['access_token', access],
            ['refresh_token', refresh],
            ['user', JSON.stringify(user)]
        ]);

        router.replace('/(tabs)');
        
    } catch (error: any) {
        console.error(error);
        const msg = error.response?.data?.error || "Nieprawidłowe dane logowania.";
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
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
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
                <View className="flex-row items-center border border-stone-200 rounded-2xl px-4 py-3 bg-stone-50">
                    <Mail size={20} className="text-stone-400 mr-3" />
                    <TextInput 
                        placeholder="Adres e-mail"
                        className="flex-1 text-stone-800 text-base"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                    />
                </View>

                <View className="flex-row items-center border border-stone-200 rounded-2xl px-4 py-3 bg-stone-50">
                    <Lock size={20} className="text-stone-400 mr-3" />
                    <TextInput 
                        placeholder="Hasło"
                        className="flex-1 text-stone-800 text-base"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                    />
                </View>

                <TouchableOpacity 
                    onPress={handleLogin}
                    disabled={loading}
                    className="bg-rose-600 rounded-2xl py-4 flex-row justify-center items-center shadow-lg shadow-rose-500/30 mt-4"
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

             <View className="flex-row justify-center mt-8">
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